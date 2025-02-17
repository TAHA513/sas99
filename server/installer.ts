import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const createInstaller = async () => {
  try {
    console.log('بدء إنشاء حزمة التثبيت...');

    // Create build directory
    const buildDir = path.join(process.cwd(), 'build-temp');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // Copy test checklist
    const testChecklistPath = path.join(process.cwd(), 'test-checklist.md');
    const testChecklistDest = path.join(buildDir, 'test-checklist.md');
    fs.copyFileSync(testChecklistPath, testChecklistDest);
    console.log('تم نسخ قائمة الفحص');

    // Create archive
    const output = fs.createWriteStream('digital-business-manager-installer.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Handle archive warnings
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
      } else {
        throw err;
      }
    });

    // Handle archive errors
    archive.on('error', (err) => {
      throw err;
    });

    // Log when the archive is finalized
    output.on('close', () => {
      console.log(`تم إنشاء حزمة التثبيت بنجاح: ${archive.pointer()} بايت`);
      // Clean up build directory
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true });
      }
    });

    archive.pipe(output);

    // Add test checklist from build directory
    archive.file(testChecklistDest, { name: 'test-checklist.md' });
    console.log('تمت إضافة قائمة الفحص إلى الحزمة');

    // Add configuration files
    archive.file('package.json', { name: 'package.json' });
    archive.file('drizzle.config.ts', { name: 'drizzle.config.ts' });
    archive.file('tailwind.config.ts', { name: 'tailwind.config.ts' });
    archive.file('tsconfig.json', { name: 'tsconfig.json' });
    archive.file('vite.config.ts', { name: 'vite.config.ts' });
    archive.file('theme.json', { name: 'theme.json' });
    archive.file('postcss.config.js', { name: 'postcss.config.js' });
    console.log('تمت إضافة ملفات الإعداد');

    // Add source code directories
    archive.directory('client/', 'client');
    archive.directory('server/', 'server');
    archive.directory('shared/', 'shared');
    console.log('تمت إضافة مجلدات الكود المصدري');

    // Add desktop shortcut creator script
    const desktopShortcutScript = `#!/bin/bash
# Function to detect the desktop directory
get_desktop_dir() {
    if [ -n "$XDG_DESKTOP_DIR" ]; then
        echo "$XDG_DESKTOP_DIR"
        return
    fi

    if [ -f "$HOME/.config/user-dirs.dirs" ]; then
        local desktop_dir=$(grep XDG_DESKTOP_DIR "$HOME/.config/user-dirs.dirs" | cut -d= -f2 | tr -d '"')
        if [ -n "$desktop_dir" ]; then
            eval echo "$desktop_dir"
            return
        fi
    fi

    echo "$HOME/Desktop"
}

# Function to find writable directory
find_writable_dir() {
    for dir in "$@"; do
        if [ -d "$dir" ] && [ -w "$dir" ]; then
            echo "$dir"
            return 0
        fi
    done
    return 1
}

APP_NAME="Digital Business Manager"
DESKTOP_DIR=$(get_desktop_dir)
ICON_PATH="$(pwd)/generated-icon.png"

# Try to find a writable location for the shortcut
SHORTCUT_DIR=$(find_writable_dir "$DESKTOP_DIR" "$HOME/.local/share/applications" "$(pwd)")

if [ -z "$SHORTCUT_DIR" ]; then
    echo "تحذير: لم نتمكن من العثور على مجلد قابل للكتابة لإنشاء الاختصار"
    echo "يمكنك تشغيل التطبيق يدوياً باستخدام الأمر: npm run dev"
    exit 1
fi

# Create .desktop file
cat > "$SHORTCUT_DIR/$APP_NAME.desktop" << EOL
[Desktop Entry]
Version=1.0
Type=Application
Name=$APP_NAME
Name[ar]=مدير الأعمال الرقمي
Comment=Digital Business Management System
Comment[ar]=نظام إدارة الأعمال الرقمي
Exec=bash -c 'cd "$(pwd)" && npm run dev'
Icon=$ICON_PATH
Terminal=false
Categories=Office;
EOL

# Set proper permissions
chmod +x "$SHORTCUT_DIR/$APP_NAME.desktop"

if [ -f "$SHORTCUT_DIR/$APP_NAME.desktop" ]; then
    echo "تم إنشاء اختصار التطبيق بنجاح في $SHORTCUT_DIR"
    if [ "$SHORTCUT_DIR" != "$DESKTOP_DIR" ]; then
        echo "ملاحظة: تم إنشاء الاختصار في $SHORTCUT_DIR بدلاً من سطح المكتب"
        echo "يمكنك نقل الملف يدوياً إلى سطح المكتب إذا أردت"
    fi
else
    echo "تحذير: تعذر إنشاء اختصار التطبيق"
    echo "يمكنك تشغيل التطبيق يدوياً باستخدام الأمر: npm run dev"
fi`;

    archive.append(desktopShortcutScript, { name: 'create-shortcut.sh' });
    console.log('تمت إضافة سكربت إنشاء الاختصار');

    // Add installation script
    const installScript = `#!/bin/bash
echo "جاري تثبيت مدير الأعمال الرقمي..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "خطأ: Node.js غير مثبت على نظامك"
    echo "الرجاء تثبيت Node.js من الموقع: https://nodejs.org/"
    exit 1
fi

# Install required packages
if ! npm install; then
    echo "حدث خطأ أثناء تثبيت الحزم المطلوبة"
    exit 1
fi

echo "جاري إنشاء اختصار سطح المكتب..."
if ! bash create-shortcut.sh; then
    echo "تحذير: حدث خطأ أثناء إنشاء اختصار سطح المكتب"
    echo "يمكنك تشغيل التطبيق يدوياً باستخدام الأمر: npm run dev"
fi

echo "اكتمل التثبيت!"
echo "لتشغيل التطبيق:"
echo "1. انقر على أيقونة التطبيق على سطح المكتب"
echo "2. أو افتح terminal في هذا المجلد واكتب: npm run dev"`;

    archive.append(installScript, { name: 'install.sh' });
    console.log('تمت إضافة سكربت التثبيت');

    // Add README
    const readmeContent = `# مدير الأعمال الرقمي - Digital Business Manager

## تعليمات التثبيت

### المتطلبات الأساسية
- Node.js 20 أو أحدث
- PostgreSQL 14 أو أحدث
- مساحة كافية على القرص (500 ميجابايت على الأقل)

### خطوات التثبيت
1. قم بفك ضغط الملف المضغوط في المجلد المطلوب
2. افتح Terminal في المجلد المستخرج
3. قم بتشغيل سكربت التثبيت:
   \`\`\`bash
   bash install.sh
   \`\`\`
4. سيتم إنشاء أيقونة التطبيق على سطح المكتب تلقائياً

### حل المشكلات الشائعة

1. إذا لم يتم إنشاء الاختصار على سطح المكتب:
   - قد يتم إنشاء الاختصار في مجلد ~/.local/share/applications
   - يمكنك نسخ الاختصار يدوياً إلى سطح المكتب
   - أو يمكنك تشغيل التطبيق مباشرة من Terminal باستخدام \`npm run dev\`

2. إذا ظهرت رسالة خطأ عند تشغيل التطبيق:
   - تأكد من تثبيت Node.js بشكل صحيح
   - تأكد من اتصال قاعدة البيانات
   - راجع ملف الأخطاء في مجلد التطبيق

### الدعم الفني
إذا واجهتك أي مشكلة، يرجى التواصل مع فريق الدعم الفني.

## الميزات الرئيسية
- إدارة المخزون والمنتجات
- إدارة العملاء والموردين
- نظام الفواتير والمبيعات
- التقارير والإحصائيات
- إدارة التسويق والحملات الإعلانية
- نظام التقسيط المتكامل`;

    archive.append(readmeContent, { name: 'README.md' });
    console.log('تمت إضافة ملف README');

    // Add application icon
    archive.file('generated-icon.png', { name: 'generated-icon.png' });
    console.log('تمت إضافة أيقونة التطبيق');

    // Finalize the archive
    await archive.finalize();
    console.log('تم إنشاء حزمة التثبيت بنجاح!');

  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء حزمة التثبيت:', error);
    throw error;
  }
};

createInstaller().catch(console.error);