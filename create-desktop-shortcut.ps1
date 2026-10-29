$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')

# 1. Update Windows Desktop Shortcut
$ShortcutPath = Join-Path $DesktopPath "CareerAI.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Users\HP\CareerAI-v2\Start-CareerAI.bat"
$Shortcut.WorkingDirectory = "C:\Users\HP\CareerAI-v2"
$Shortcut.IconLocation = "C:\Users\HP\CareerAI-v2\public\assets\SG-CUBE.ico,0"
$Shortcut.Description = "CareerAI - AI Career Intelligence Platform (Gemini 3.8 Flash)"
$Shortcut.Save()

# 2. Update Direct Batch Launcher on Desktop
Copy-Item "C:\Users\HP\CareerAI-v2\Start-CareerAI.bat" (Join-Path $DesktopPath "CareerAI-App.bat") -Force

Write-Host "DESKTOP_UPDATED_GEMINI_3_8"
