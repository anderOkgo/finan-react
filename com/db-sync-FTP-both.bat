@ECHO OFF
SETLOCAL
IF EXIST setter.bat (CD.. & CALL com\setter.bat) ELSE ( CALL com\setter.bat )
".\WinSCP.com" ^
  /command ^
    "open ftp://%FTPUsername.txt%:%FTPPss.txt%@%FTPserver.txt%" ^
    "option batch off" ^
    "rmdir assets" ^
    "synchronize remote  ""%LocalPath.txt%\"" /%FTPFolder.txt%" ^
    "exit"
SET "RESULT=%ERRORLEVEL%"
IF %RESULT% EQU 0 (Echo No error found) ELSE (Echo An error was found)
REM Keeps the window open 5 seconds. Not TIMEOUT: it fails without a console (npm, redirected input).
ping -n 6 127.0.0.1 >NUL
EXIT /B %RESULT%
