@echo off
setlocal
setlocal ENABLEDELAYEDEXPANSION
rem make sure ctrl.p git submodule has been synced and updated


SET _VIM_LOCATION=

IF EXIST "%ProgramFiles(x86)%\vim\_vimrc" ( 
    SET _VIM_LOCATION="%ProgramFiles(x86)%\vim"
    SET _VIM_LOCATION=!_VIM_LOCATION:~1,-1!
) ELSE (
    IF EXIST "%ProgramFiles%\vim\_vimrc" ( 
        SET _VIM_LOCATION="%ProgramFiles%\vim"
        SET _VIM_LOCATION=!_VIM_LOCATION:~1,-1!
    ) ELSE (
    echo "Did not find _vimrc, exiting"
        goto End
    )
)

echo Using Vim location: %_VIM_LOCATION%

:: Back up oroginal rc file
IF EXIST "%_VIM_LOCATION%\_vimrc" ( 
    copy "%_VIM_LOCATION%\_vimrc" "%_VIM_LOCATION%\_vimrc.bak"
    del "%_VIM_LOCATION%\_vimrc"
)

mklink "%_VIM_LOCATION%\_vimrc"     %CD%\windows.vim
mklink "%_VIM_LOCATION%\shared.vim" %CD%\shared.vim
mklink "%_VIM_LOCATION%\fzf.vim"    %CD%\fzf\plugin\fzf.vim

mkdir "%_VIM_LOCATION%\bundle"
mklink /d "%_VIM_LOCATION%\bundle\fzf.vim"   %CD%\fzf.vim

:End
