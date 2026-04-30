' launcher.vbs — Spider Station Silent Launcher
' Uses FileSystemObject for rock-solid path resolution.
' Window style 0 = completely hidden (no black CMD screen).

On Error Resume Next

Dim oFso, oShell, scriptDir, batPath

Set oFso   = CreateObject("Scripting.FileSystemObject")
Set oShell = CreateObject("WScript.Shell")

' GetParentFolderName gives the folder this .vbs lives in
scriptDir = oFso.GetParentFolderName(WScript.ScriptFullName)
batPath   = oFso.BuildPath(scriptDir, "RUN-CLICK.bat")

' Verify the batch file actually exists before trying to run it
If Not oFso.FileExists(batPath) Then
    MsgBox "ERROR: RUN-CLICK.bat not found at:" & Chr(13) & batPath & Chr(13) & Chr(13) & _
           "Make sure launcher.vbs and RUN-CLICK.bat are in the same folder.", _
           16, "CLICK Cafe OS — Launch Error"
    WScript.Quit 1
End If

' Run hidden (0), non-blocking (False) — returns instantly, no CMD window
oShell.Run "cmd /c """ & batPath & """", 0, False

If Err.Number <> 0 Then
    MsgBox "Launch failed: " & Err.Description & Chr(13) & Chr(13) & _
           "Try running RUN-CLICK.bat directly to see the error.", _
           16, "CLICK Cafe OS — Launch Error"
End If

Set oFso   = Nothing
Set oShell = Nothing
