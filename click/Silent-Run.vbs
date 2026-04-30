' Silent-Run.vbs
' Launches RUN-CLICK.bat completely hidden — no black CMD window visible.
' This file is called by the Desktop shortcut created by Create-Shortcut.vbs.

Dim oShell
Set oShell = CreateObject("WScript.Shell")

' Resolve the folder this script lives in
Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))

' Run bat hidden (window style 0), non-blocking (False = don't wait)
oShell.Run "cmd /c """ & scriptDir & "RUN-CLICK.bat""", 0, False

Set oShell = Nothing
