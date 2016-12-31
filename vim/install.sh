#!/bin/sh


if [ ! -f ~/.vimrc ]; then
    ln -s  $PWD/linux.vim ~/.vimrc
fi

if [ ! -f /usr/share/vim/vim74/shared.vim ]; then
    ln -s  $PWD/shared.vim /usr/share/vim/vim74/shared.vim
fi
 
if [ ! -d ~/.vim/bundle ]; then
    mkdir ~/.vim/bundle
    ln -s  $PWD/ctrlp.vim ~/.vim/bundle/ctrlp.vim
fi

