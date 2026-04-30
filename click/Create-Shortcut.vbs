' Create-Shortcut.vbs
' Run this once from the CLICK_CLIENT_SOFTWARE folder.
' It creates a "CLICK CAFE OS" shortcut on the Desktop that launches the
' software silently (no CMD window) via Silent-Run.vbs.

Dim oShell, oFso, oLink
Set oShell = CreateObject("WScript.Shell")
Set oFso   = CreateObject("Scripting.FileSystemObject")

' Folder where this script lives (the delivery folder)
Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))

' Verify required files exist before creating shortcut
If Not oFso.FileExists(scriptDir & "Silent-Run.vbs") Then
    MsgBox "ERROR: Silent-Run.vbs not found in:" & Chr(13) & scriptDir & Chr(13) & Chr(13) & _
           "Make sure both files are in the same folder.", 16, "Setup Error"
    WScript.Quit 1
End If

If Not oFso.FileExists(scriptDir & "RUN-CLICK.bat") Then
    MsgBox "ERROR: RUN-CLICK.bat not found in:" & Chr(13) & scriptDir & Chr(13) & Chr(13) & _
           "Make sure both files are in the same folder.", 16, "Setup Error"
    WScript.Quit 1
End If

' Desktop path for current user
Dim desktopPath
desktopPath = oShell.SpecialFolders("Desktop")

' Create the shortcut
Dim shortcutPath
shortcutPath = desktopPath & "\CLICK CAFE OS.lnk"

Set oLink = oShell.CreateShortcut(shortcutPath)
oLink.TargetPath      = "wscript.exe"
oLink.Arguments       = """" & scriptDir & "Silent-Run.vbs"""
oLink.WorkingDirectory = scriptDir
oLink.WindowStyle     = 1          ' Normal window for wscript (it's hidden anyway)
oLink.Description     = "CLICK Cafe OS — Spider Station by Zahid ImAm"

' Icon priority: public\favicon.ico > shell32.dll computer icon
Dim iconPath
iconPath = scriptDir & "public\favicon.ico"
If oFso.FileExists(iconPath) Then
    oLink.IconLocation = iconPath & ",0"
Else
    ' shell32.dll index 15 = monitor/computer icon (clean, professional)
    oLink.IconLocation = "shell32.dll,15"
End If

oLink.Save

' Confirm
MsgBox "Setup complete!" & Chr(13) & Chr(13) & _
       "A shortcut named ""CLICK CAFE OS"" has been placed on your Desktop." & Chr(13) & Chr(13) & _
       "Double-click it anytime to launch Spider Station." & Chr(13) & _
       "(No black window will appear — it opens directly in the browser.)", _
       64, "CLICK Cafe OS — Setup"

Set oLink  = Nothing
Set oFso   = Nothing
Set oShell = Nothing
