source $VIMRUNTIME\..\shared.vim
"source $VIMRUNTIME\mswin.vim
"
behave mswin
"
"" set vim to chdir for each file, do i want this?
"if exists("+autochdir")
"  set autochdir
"else
"  autocmd BufEnter * silent! lcd %:p:h:gs/ /\ /
"endif
"

"""""""""""" Fzf""""""""""""
" Looks at all files
nmap <C-p> :Files<CR>

" Ignores files in .gitignore, but fails if you are not in a git repo
"nmap <C-p> :GFiles<CR> 

"" Vim 8 added a mapping to ctrl-f
"silent! unmap  <C-F>
"silent! iunmap <C-F>
"
