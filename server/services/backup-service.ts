import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import { db } from '../db';

const execAsync = promisify(exec);

interface BackupSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  lastBackup?: Date;
  retentionDays: number;
}

export class BackupService {
  private backupDir: string;
  private schedule: BackupSchedule;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    // Default schedule settings
    this.schedule = {
      enabled: false,
      frequency: 'daily',
      retentionDays: 30
    };
    this.initializeSchedule();
  }

  private async initializeSchedule() {
    try {
      await this.ensureBackupDir();
      await this.loadScheduleFromDB();
      if (this.schedule.enabled) {
        this.startScheduledBackups();
      }
    } catch (error) {
      console.error('Error initializing backup schedule:', error);
    }
  }

  private async loadScheduleFromDB() {
    const settings = await db.query.settings.findFirst({
      where: (settings, { eq }) => eq(settings.key, 'backup_schedule')
    });

    if (settings) {
      this.schedule = JSON.parse(settings.value);
    }
  }

  async updateSchedule(schedule: BackupSchedule) {
    this.schedule = schedule;
    await db.insert(db.settings).values({
      key: 'backup_schedule',
      value: JSON.stringify(schedule)
    }).onConflictDoUpdate({
      target: [db.settings.key],
      set: { value: JSON.stringify(schedule) }
    });

    if (schedule.enabled) {
      this.startScheduledBackups();
    }
  }

  private async cleanupOldBackups() {
    const files = await fs.readdir(this.backupDir);
    const now = new Date();

    for (const file of files) {
      const filePath = path.join(this.backupDir, file);
      const stats = await fs.stat(filePath);
      const ageInDays = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (ageInDays > this.schedule.retentionDays) {
        await fs.unlink(filePath);
      }
    }
  }

  private startScheduledBackups() {
    const scheduleBackup = async () => {
      try {
        await this.generateBackup();
        await this.cleanupOldBackups();
        this.schedule.lastBackup = new Date();
        await this.updateSchedule(this.schedule);
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    };

    let interval: number;
    switch (this.schedule.frequency) {
      case 'daily':
        interval = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case 'weekly':
        interval = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'monthly':
        interval = 30 * 24 * 60 * 60 * 1000; // ~30 days
        break;
    }

    // Schedule next backup
    setTimeout(scheduleBackup, this.getNextBackupTime());
  }

  private getNextBackupTime(): number {
    if (!this.schedule.lastBackup) {
      return 0; // Run immediately if no previous backup
    }

    const lastBackup = new Date(this.schedule.lastBackup);
    let nextBackup: Date;

    switch (this.schedule.frequency) {
      case 'daily':
        nextBackup = new Date(lastBackup);
        nextBackup.setDate(nextBackup.getDate() + 1);
        nextBackup.setHours(2, 0, 0, 0); // Run at 2 AM
        break;
      case 'weekly':
        nextBackup = new Date(lastBackup);
        nextBackup.setDate(nextBackup.getDate() + 7);
        nextBackup.setHours(2, 0, 0, 0);
        break;
      case 'monthly':
        nextBackup = new Date(lastBackup);
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        nextBackup.setHours(2, 0, 0, 0);
        break;
    }

    const delay = nextBackup.getTime() - Date.now();
    return delay > 0 ? delay : 0;
  }

  private async ensureBackupDir() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async generateBackup(): Promise<string> {
    await this.ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}.zip`);
    const output = createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    // Backup database
    const dbBackupPath = path.join(this.backupDir, 'database.sql');
    await this.backupDatabase(dbBackupPath);
    archive.file(dbBackupPath, { name: 'database.sql' });

    // Backup settings and configurations
    const settings = await this.getSystemSettings();
    archive.append(JSON.stringify(settings, null, 2), { name: 'settings.json' });

    // Backup uploads directory if exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsDir);
      archive.directory(uploadsDir, 'uploads');
    } catch {
      // Uploads directory doesn't exist, skip
    }

    await archive.finalize();

    // Cleanup temporary files
    await fs.unlink(dbBackupPath);

    return backupPath;
  }

  private async backupDatabase(outputPath: string) {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) throw new Error('DATABASE_URL not found');

    const connectionParams = new URL(DATABASE_URL);

    await execAsync(
      `pg_dump -h ${connectionParams.hostname} -p ${connectionParams.port} -U ${
        connectionParams.username
      } -d ${connectionParams.pathname.slice(1)} -f ${outputPath}`,
      {
        env: {
          PGPASSWORD: connectionParams.password,
          ...process.env,
        },
      }
    );
  }

  private async getSystemSettings() {
    const settings = await db.query.settings.findMany();
    return settings;
  }

  async restoreBackup(backupPath: string): Promise<void> {
    const extractDir = path.join(this.backupDir, 'temp');
    await fs.mkdir(extractDir, { recursive: true });

    await execAsync(`unzip -o ${backupPath} -d ${extractDir}`);

    await this.restoreDatabase(path.join(extractDir, 'database.sql'));

    const settings = JSON.parse(
      await fs.readFile(path.join(extractDir, 'settings.json'), 'utf-8')
    );
    await this.restoreSettings(settings);

    const uploadsBackup = path.join(extractDir, 'uploads');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsBackup);
      await fs.rm(uploadsDir, { recursive: true, force: true });
      await fs.cp(uploadsBackup, uploadsDir, { recursive: true });
    } catch {
      // No uploads to restore
    }

    await fs.rm(extractDir, { recursive: true });
  }

  private async restoreDatabase(sqlFile: string) {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) throw new Error('DATABASE_URL not found');

    const connectionParams = new URL(DATABASE_URL);

    await execAsync(
      `psql -h ${connectionParams.hostname} -p ${connectionParams.port} -U ${
        connectionParams.username
      } -d ${connectionParams.pathname.slice(1)} -f ${sqlFile}`,
      {
        env: {
          PGPASSWORD: connectionParams.password,
          ...process.env,
        },
      }
    );
  }

  private async restoreSettings(settings: any[]) {
    for (const setting of settings) {
      await db.insert(db.settings).values(setting).onConflictDoUpdate({
        target: db.settings.id,
        set: setting
      });
    }
  }

  getSchedule(): BackupSchedule {
    return this.schedule;
  }
}

export const backupService = new BackupService();