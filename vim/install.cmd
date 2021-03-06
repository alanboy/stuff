@echo off

echo ===== VIM =====
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

IF NOT EXIST "%_VIM_LOCATION%\bundle" (
    mkdir "%_VIM_LOCATION%\bundle"
)
mklink /d "%_VIM_LOCATION%\bundle\fzf.vim"                  %CD%\fzf.vim
mklink /d "%_VIM_LOCATION%\bundle\vim-gitgutter"            %CD%\vim-gitgutter
mklink /d "%_VIM_LOCATION%\bundle\vim-mustache-handlebars"  %CD%\vim-mustache-handlebars

rem fix this later
rem mklink /d vim-mustache-handlebars/syntax/*   ~/.vim/syntax/
rem mklink /d vim-mustache-handlebars/ftdetect/* ~/.vim/ftdetect/
rem mklink /d vim-mustache-handlebars/ftplugin/* ~/.vim/ftplugin/
rem 
rem :: Install pathogen
rem mklink "%_VIM_LOCATION%\vim80\autoload\pathogen.vim"   %CD%\vim-pathogen\autoload\pathogen.vim


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

:: :: Back up oroginal rc file
:: IF EXIST "%_NEOVIM_LOCATION%\_vimrc" (
::     copy "%_NEOVIM_LOCATION%\_vimrc" "%_NEOVIM_LOCATION%\_vimrc.bak"
::     del "%_NEOVIM_LOCATION%\_vimrc"
:: )


mklink    "%_NEOVIM_LOCATION%\share\nvim\runtime\_vimrc"     %CD%\windows.vim
mklink    "%_NEOVIM_LOCATION%\share\nvim\shared.vim" %CD%\shared.vim
mklink    "%_NEOVIM_LOCATION%\share\nvim\fzf.vim"    %CD%\fzf\plugin\fzf.vim
mkdir     "%_NEOVIM_LOCATION%\share\nvim\bundle"
mklink /d "%_NEOVIM_LOCATION%\share\nvim\bundle\fzf.vim"   %CD%\fzf.vim

:End
