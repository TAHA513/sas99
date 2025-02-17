import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const createInstaller = async () => {
  const output = fs.createWriteStream('digital-business-manager-installer.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', () => {
    console.log(`Installation package created: ${archive.pointer()} total bytes`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add package.json
  archive.file('package.json', { name: 'package.json' });

  // Add all source code directories
  archive.directory('client/', 'client');
  archive.directory('server/', 'server');
  archive.directory('shared/', 'shared');

  // Add configuration files
  archive.file('drizzle.config.ts', { name: 'drizzle.config.ts' });
  archive.file('tailwind.config.ts', { name: 'tailwind.config.ts' });
  archive.file('tsconfig.json', { name: 'tsconfig.json' });
  archive.file('vite.config.ts', { name: 'vite.config.ts' });
  archive.file('theme.json', { name: 'theme.json' });
  archive.file('postcss.config.js', { name: 'postcss.config.js' });

  // Add desktop shortcut creator
  const desktopShortcutScript = `
#!/bin/bash
APP_NAME="Digital Business Manager"
ICON_PATH="$(pwd)/generated-icon.png"
DESKTOP_FILE="$HOME/Desktop/$APP_NAME.desktop"

echo "[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Comment=Digital Business Management System
Exec=bash -c 'cd $(pwd) && npm run dev'
Icon=$ICON_PATH
Terminal=false
Categories=Office;" > "$DESKTOP_FILE"

chmod +x "$DESKTOP_FILE"
echo "Desktop shortcut created successfully!"
  `;

  archive.append(desktopShortcutScript, { name: 'create-shortcut.sh' });
  
  // Add installation script
  const installScript = `
#!/bin/bash
echo "Installing Digital Business Manager..."
npm install
echo "Creating desktop shortcut..."
bash create-shortcut.sh
echo "Installation completed! You can now start the application from your desktop."
  `;

  archive.append(installScript, { name: 'install.sh' });

  // Add readme with installation instructions
  const readmeContent = `
# Digital Business Manager - تطبيق إدارة الأعمال الرقمية

## تعليمات التثبيت

1. قم بفك ضغط الملف المضغوط
2. افتح Terminal في المجلد المستخرج
3. قم بتشغيل سكربت التثبيت:
   \`\`\`
   bash install.sh
   \`\`\`
4. سيتم إنشاء أيقونة التطبيق على سطح المكتب تلقائياً

## متطلبات النظام
- Node.js 20 أو أحدث
- PostgreSQL 14 أو أحدث

## الدعم الفني
إذا واجهتك أي مشكلة، يرجى التواصل مع فريق الدعم الفني.
  `;

  archive.append(readmeContent, { name: 'README.md' });

  // Add application icon
  archive.file('generated-icon.png', { name: 'generated-icon.png' });

  await archive.finalize();
};

createInstaller().catch(console.error);
