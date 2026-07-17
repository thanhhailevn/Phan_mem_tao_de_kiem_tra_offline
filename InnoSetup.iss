[Setup]
AppName=AntiGravity Edu
AppVersion=1.0.0
DefaultDirName={pf}\AntiGravityEdu
DefaultGroupName=AntiGravity Edu
OutputDir=.\Output
OutputBaseFilename=AntiGravityEdu_Installer
Compression=lzma
SolidCompression=yes

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked

[Files]
Source: "src-tauri\target\release\AntiGravity Edu.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "src-tauri\target\release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\AntiGravity Edu"; Filename: "{app}\AntiGravity Edu.exe"
Name: "{commondesktop}\AntiGravity Edu"; Filename: "{app}\AntiGravity Edu.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\AntiGravity Edu.exe"; Description: "Launch AntiGravity Edu"; Flags: nowait postinstall skipifsilent
