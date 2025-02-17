import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import { storage } from '../storage';

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

    // Get all data from memory storage
    const data = {
      settings: await storage.getSettings(),
      customers: await storage.getCustomers(),
      products: await storage.getProducts(),
      invoices: await storage.getInvoices(),
      staff: await storage.getStaff(),
      appointments: await storage.getAppointments(),
      productGroups: await storage.getProductGroups(),
      suppliers: await storage.getSuppliers(),
      purchaseOrders: await storage.getPurchaseOrders(),
      storeSettings: await storage.getStoreSettings(),
    };

    // Add data to archive
    archive.append(JSON.stringify(data, null, 2), { name: 'data.json' });

    // Backup uploads directory if exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsDir);
      archive.directory(uploadsDir, 'uploads');
    } catch {
      // Uploads directory doesn't exist, skip
    }

    await archive.finalize();

    return backupPath;
  }

  async restoreBackup(backupPath: string): Promise<void> {
    const extractDir = path.join(this.backupDir, 'temp');
    await fs.mkdir(extractDir, { recursive: true });

    // Extract backup
    await execAsync(`unzip -o ${backupPath} -d ${extractDir}`);

    try {
      // Read and restore data
      const data = JSON.parse(
        await fs.readFile(path.join(extractDir, 'data.json'), 'utf-8')
      );

      // Clear existing data
      (storage as any).data.clear();

      // Restore data
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            const prefix = key.slice(0, -1); // Remove 's' from plural
            (storage as any).data.set(`${prefix}-${item.id}`, item);
          }
        }
      }

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
    } finally {
      // Cleanup
      await fs.rm(extractDir, { recursive: true });
    }
  }
}

export const backupService = new BackupService();