#!/bin/sh


if [ ! -f ~/.vimrc ]; then
    ln -s  $PWD/linux.vim ~/.vimrc
fi

if [ ! -f /usr/share/vim/vim74/shared.vim ]; then
    ln -s  $PWD/shared.vim /usr/share/vim/vim74/shared.vim
fi

if [ ! -f /usr/share/vim/vim74/fzf.vim ]; then
    ln -s  $PWD/fzf/plugin/fzf.vim /usr/share/vim/vim74/fzf.vim
fi

if [ ! -d ~/.vim/bundle ]; then
    mkdir ~/.vim/bundle
fi

if [ ! -f ~/.vim/bundle/fzf.vim ]; then
    ln -s  $PWD/fzf.vim  ~/.vim/bundle/fzf.vim
fi
