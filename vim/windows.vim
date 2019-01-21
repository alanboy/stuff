source $VIMRUNTIME\..\shared.vim
source $VIMRUNTIME\mswin.vim

behave mswin

" set vim to chdir for each file, do i want this?
if exists("+autochdir")
  set autochdir
else
  autocmd BufEnter * silent! lcd %:p:h:gs/ /\ /
endif

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" set path=$PWD\**
source $VIMRUNTIME\..\fzf.vim
set runtimepath^=$VIMRUNTIME\..\bundle\fzf.vim
nmap <C-p> :GFiles<CR>

" Vim 8 added a mapping to ctrl-f
silent! unmap  <C-F>
silent! iunmap <C-F>
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

set runtimepath^=$VIMRUNTIME\..\bundle\vim-gitgutter

