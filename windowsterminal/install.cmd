@echo off
setlocal ENABLEDELAYEDEXPANSION

rem SET Store=RoamingState
SET Store=LocalState
SET ConfigurationDir=%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\%Store%
SET TargetConfigurationFile=%ConfigurationDir%\settings.json
SET BackupConfiguraitonFile=%ConfigurationDir%\settings.json.backup

if "%1" == "--restore" (
    echo RESTORING BACKUP

    IF NOT EXIST "%BackupConfiguraitonFile%" (
        echo Error: There is no backup to restore!!!
        goto FinishScript
    )

    del "%TargetConfigurationFile%"
    copy "%BackupConfiguraitonFile%" "%TargetConfigurationFile%"

) else (
    echo INSTALLING CONFIGURATION

    copy "%TargetConfigurationFile%" "%BackupConfiguraitonFile%"
    del "%TargetConfigurationFile%"
    mklink "%TargetConfigurationFile%" %CD%\settings.json
    copy "%CD%\*.jpg*" "%ConfigurationDir%"
)





:FinishScript
echo Done.
