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

if [ ! -d $PathToVim/bundle ]; then
    mkdir $PathToVim/bundle
fi

if [ ! -f $PathToVim/bundle/fzf.vim ]; then
    ln -s  $PWD/fzf.vim  $PathToVim/bundle/fzf.vim
fi

## To install fzf correctly:
echo Installation is not complete, look at this script for 
echo how to install fzf
# git submodule update
# run install inside fzf
# make fzf avaiable with 
# sudo ln -s ~/stuff/vim/fzf/bin/fzf /usr/local/bin/
