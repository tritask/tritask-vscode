@echo off

set DIST_FOLDER_NAME=tritask-vscode

set thisdir=%~dp0
set COPYCMD=xcopy
set COPYOPT_FILE=/-Y
set COPYOPT_FOLDER=/-Y /S /E /I
set DIST_FOLDER_FULLPATH=%thisdir%%DIST_FOLDER_NAME%

if exist %DIST_FOLDER_FULLPATH% (
	rmdir /s /q %DIST_FOLDER_FULLPATH%
	if exist %DIST_FOLDER_FULLPATH% (
		echo Cannot remove the folder "%DIST_FOLDER_FULLPATH%".
		echo Please close files in the folder.
		pause
		exit /b
	)
)

pushd %~dp0tritask-basics
call vsce package -o ..\tritask-syntax.vsix
popd

pushd %~dp0tritask-language-features
call vsce package -o ..\tritask-command.vsix
popd

mkdir "%DIST_FOLDER_FULLPATH%"
%COPYCMD% "%thisdir%tritask-syntax.vsix" "%DIST_FOLDER_FULLPATH%" %COPYOPT_FILE%
%COPYCMD% "%thisdir%tritask-command.vsix" "%DIST_FOLDER_FULLPATH%" %COPYOPT_FILE%
%COPYCMD% "%thisdir%README.md" "%DIST_FOLDER_FULLPATH%" %COPYOPT_FILE%
rem I do not know how to disable F=File D=Directory confirmation, so use copy command simply.
copy "%thisdir%tritask-basics\settings.json" "%DIST_FOLDER_FULLPATH%\settings-for-tritask-syntax.json"
copy "%thisdir%tritask-basics\CHANGELOG.md" "%DIST_FOLDER_FULLPATH%\CHANGELOG-tritask-syntax.md"
copy "%thisdir%tritask-language-features\CHANGELOG.md" "%DIST_FOLDER_FULLPATH%\CHANGELOG-tritask-command.md"

pause
