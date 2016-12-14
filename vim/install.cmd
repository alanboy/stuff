
setlocal
rem make sure ctrl.p git submodule has been synced and updated


SET _VIM_LOCATION=

IF EXIST "%ProgramFiles(x86)%\vim\_vimrc" ( 
    SET _VIM_LOCATION=%ProgramFiles(x86)%\vim
) ELSE (
    IF EXIST "%ProgramFiles%\vim\_vimrc" ( 
        SET _VIM_LOCATION=%ProgramFiles%\vim
    ) ELSE (
        goto End
    )
)

echo Using Vim location: %_VIM_LOCATION%

IF EXIST "%_VIM_LOCATION%\_vimrc" ( 
    copy "%_VIM_LOCATION%\_vimrc" "%_VIM_LOCATION%\_vimrc.bak"
    del "%_VIM_LOCATION%\_vimrc"
)

mklink "%_VIM_LOCATION%\_vimrc"  %CD%\windows.vim


mkdir "%_VIM_LOCATION%\bundle"
mklink /d "%_VIM_LOCATION%\bundle\ctrlp.vim" %CD%\ctrlp.vim

:End
