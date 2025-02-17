
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
  