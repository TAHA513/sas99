{pkgs}: {
  deps = [
    pkgs.xorg.libxkbfile
    pkgs.cups
    pkgs.atk
    pkgs.dbus
    pkgs.alsa-lib
    pkgs.gtk3
    pkgs.nspr
    pkgs.nss
    pkgs.mesa
    pkgs.xorg.libXScrnSaver
    pkgs.xorg.libX11
    pkgs.glib
    pkgs.postgresql
  ];
}
