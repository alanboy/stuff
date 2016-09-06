
rem make sure ctrl.p git submodule has been synced and updated

copy "%ProgramFiles(x86)%\vim\_vimrc" "%ProgramFiles(x86)%\vim\_vimrc.bak"
del "%ProgramFiles(x86)%\vim\_vimrc"

mklink "%ProgramFiles(x86)%\vim\_vimrc"  %CD%\windows.vim

mkdir "%ProgramFiles(x86)%\vim\bundle"
mklink /d "%ProgramFiles(x86)%\vim\bundle\ctrlp.vim" %CD%\ctrlp.vim



