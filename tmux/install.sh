#!/bin/sh

sudo apt-get install tmuxinator

export EDITOR='vim'

if [ ! -f ~/.tmux.conf ]; then
    ln -s  `pwd`/tmux.conf ~/.tmux.conf
fi

if [ ! -d ~/.tmuxinator/ ]; then
    mkdir ~/.tmuxinator
fi

if [ ! -f ~/.tmuxinator/omegaup.yml ]; then
    ln -s  `pwd`/omegaup.tmuxinator.yml ~/.tmuxinator/omegaup.yml
fi

if [ ! -f ~/.tmuxinator/enterpos.yml ]; then
    ln -s  `pwd`/enterpos.tmuxinator.yml ~/.tmuxinator/enterpos.yml
fi

