#!/bin/sh

PathToVim=$(find   /usr/share/vim  -regextype posix-extended -regex '.*vim[0-9]+')

if [ ! -f ~/.vimrc ]; then
    ln -s  $PWD/linux.vim ~/.vimrc
fi

if [ ! -f $PathToVim/shared.vim ]; then
    ln -s  $PWD/shared.vim $PathToVim/shared.vim
fi

if [ ! -f $PathToVim/fzf.vim ]; then
    ln -s  $PWD/fzf/plugin/fzf.vim $PathToVim/fzf.vim
fi

if [ ! -d ~/.vim/bundle ]; then
    mkdir ~/.vim/bundle
fi

if [ ! -f ~/.vim/bundle/fzf.vim ]; then
    ln -s  $PWD/fzf.vim  ~/.vim/bundle/fzf.vim
fi
