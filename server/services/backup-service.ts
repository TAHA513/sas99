import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import { db } from '../db';

const execAsync = promisify(exec);

export class BackupService {
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
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

    // Using pg_dump for backup
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
    // Fetch all settings from database
    const settings = await db.query.settings.findMany();
    return settings;
  }

  async restoreBackup(backupPath: string): Promise<void> {
    const extractDir = path.join(this.backupDir, 'temp');
    await fs.mkdir(extractDir, { recursive: true });

    // Extract backup
    await execAsync(`unzip -o ${backupPath} -d ${extractDir}`);

    // Restore database
    await this.restoreDatabase(path.join(extractDir, 'database.sql'));

    // Restore settings
    const settings = JSON.parse(
      await fs.readFile(path.join(extractDir, 'settings.json'), 'utf-8')
    );
    await this.restoreSettings(settings);

    // Restore uploads if exists
    const uploadsBackup = path.join(extractDir, 'uploads');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsBackup);
      await fs.rm(uploadsDir, { recursive: true, force: true });
      await fs.cp(uploadsBackup, uploadsDir, { recursive: true });
    } catch {
      // No uploads to restore
    }

    // Cleanup
    await fs.rm(extractDir, { recursive: true });
  }

  private async restoreDatabase(sqlFile: string) {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) throw new Error('DATABASE_URL not found');

    const connectionParams = new URL(DATABASE_URL);

    // Using psql for restore
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
    // Restore settings to database
    for (const setting of settings) {
      await db.insert(db.settings).values(setting).onConflictDoUpdate({
        target: db.settings.id,
        set: setting
      });
    }
  }
}

export const backupService = new BackupService();
