

mklink "%ProgramFiles(x86)%\vim\_vimrc"  C:\Users\alango\stuff\vim\windows.vim

copy "%ProgramFiles(x86)%\vim\_vimrc" "%ProgramFiles(x86)%\vim\_vimrc.bak"

mkdir "%ProgramFiles(x86)%\vim\bundle" 

mklink /d "%ProgramFiles(x86)%\vim\bundle\ctrlp.vim" C:\Users\alango\stuff\vim\ctrlp.vim



