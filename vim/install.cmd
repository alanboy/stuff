@echo off

::::::::::::::::::: VIM :::::::::::::::::::::::::::::::::::::::::::::::
echo ===== VIM =====
setlocal
setlocal ENABLEDELAYEDEXPANSION

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
IF NOT EXIST "%_VIM_LOCATION%\bundle" (
    mkdir "%_VIM_LOCATION%\bundle"
)

::::::::::::::::::: NEOVIM :::::::::::::::::::::::::::::::::::::::::::::::
echo ===== NEOVIM =====
IF NOT EXIST "%LOCALAPPDATA%\nvim\" (
    mkdir "%LOCALAPPDATA%\nvim\"
)
mklink "%LOCALAPPDATA%\nvim\init.vim"       %CD%\neovim.init.vim

set _NEOVIM_LOCATION=
IF EXIST "%ProgramFiles(x86)%\nvim\" (
    SET _NEOVIM_LOCATION="%ProgramFiles(x86)%\nvim"
    SET _NEOVIM_LOCATION=!_NEOVIM_LOCATION:~1,-1!
)

echo Using NeoVim location: %_NEOVIM_LOCATION%
mklink    "%_NEOVIM_LOCATION%\share\nvim\runtime\_vimrc"     %CD%\windows.vim

mklink    "%_NEOVIM_LOCATION%\share\nvim\runtime\_vimrc"     %CD%\windows.vim
mklink    "%_NEOVIM_LOCATION%\share\nvim\shared.vim" %CD%\shared.vim
mkdir     "%_NEOVIM_LOCATION%\share\nvim\bundle"

:End
