#!/bin/sh

sudo apt-get install tmuxinator

export EDITOR='vim'

if [ ! -f ~/.tmux.conf ]; then
    ln -s  `pwd`/tmux.conf ~/.tmux.conf
fi

if [ ! -d ~/.tmuxinator/ ]; then
    mkdir ~/.tmuxinator
fi

if [ ! -f ~/.tmuxinator/devmatch.yml ]; then
    ln -s  `pwd`/devmatch.tmuxinator.yml ~/.tmuxinator/devmatch.yml
fi

if [ ! -f ~/.tmuxinator/enterpos.yml ]; then
    ln -s  `pwd`/enterpos.tmuxinator.yml ~/.tmuxinator/enterpos.yml
fi

