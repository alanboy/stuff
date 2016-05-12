set nocompatible

" Use visual bell instead of beeping. The terminal code to display the
" visual bell is given with t_vb. When no beep or flash is wanted,
set vb t_vb=

" generic options
set clipboard=unnamed
set expandtab
set hlsearch
set ignorecase
set incsearch
set list
set listchars=tab:>-,trail:~,eol:$,precedes:<,nbsp:+
set nobackup
set noswapfile
set nowrap
set number
set scrolloff=5 " Set 5 lines to the cursor - when moving vertically using j/k
set sessionoptions+=resize,winpos
set shiftwidth=4
set smartcase
set splitright " whats this ?
set tabstop=4
set wildmenu " autocomplete vim commands
set autoread

colo desert
syntax enable

"""""""""""""""""""""""""""""""""""""""""""""""""""""
" => Status line
"""""""""""""""""""""""""""""""""""""""""""""""""""""

hi User0 guifg=#ffffff  guibg=#094afe
hi User1 guifg=#ffdad8  guibg=#880c0e
hi User2 guifg=#000000  guibg=#F4905C
hi User3 guifg=#292b00  guibg=#f4f597
hi User4 guifg=#112605  guibg=#aefe7B
hi User5 guifg=#051d00  guibg=#7dcc7d
hi User7 guifg=#ffffff  guibg=#880c0e gui=bold
hi User8 guifg=#ffffff  guibg=#5b7fbb
hi User9 guifg=#ffffff  guibg=#810085

" maybe add some colors to console later, like this:
"hi User1 ctermbg=green ctermfg=red   guibg=green guifg=red
"hi User2 ctermbg=red   ctermfg=blue  guibg=red   guifg=blue
"hi User3 ctermbg=blue  ctermfg=green guibg=blue  guifg=green

set laststatus=2
set statusline=
set statusline+=%7*\[%n]                                  "buffernr
set statusline+=%1*\ %<%F\                                "File+path
set statusline+=%2*\ %y\                                  "FileType
set statusline+=%3*\ %{''.(&fenc!=''?&fenc:&enc).''}      "Encoding
set statusline+=%3*\ %{(&bomb?\",BOM\":\"\")}\            "Encoding2
set statusline+=%4*\ %{&ff}\                              "FileFormat (dos/unix..) 
"set statusline+=%5*\ %{&spelllang}\%{HighlightSearch()}\  "Spellanguage & Highlight on?
set statusline+=%8*\ %=\ row:%l/%L\ (%03p%%)\             "Rownumber/total (%)
set statusline+=%9*\ col:%03c\                            "Colnr
set statusline+=%0*\ \ %m%r%w\ %P\ \                      "Modified? Readonly? Top/bot.

 " set vim to chdir for each file
 "if exists(+autochdir)
 "set autochdir
 "else
 "autocmd BufEnter * silent! lcd %:p:h:gs/ /\ /
 "endif

au WinLeave * set nocursorline nocursorcolumn
au WinEnter * set cursorline cursorcolumn

 au BufNewFile,BufRead *.man set filetype=xml
set path=$PWD\**
"set runtimepath^=$VIMRUNTIME/plugin/ctrlp.vim
"set runtimepath^=$VIMRUNTIME\..\bundle\ctrlp.vim
set runtimepath^=~/.vim/bundle/ctrlp.vim

 "  tohtml
 let html_use_css=1 "Use stylesheet instead of inline style
 let html_number_lines=0 "dont show line numbers
 let html_no_pre=1

au BufNewFile,BufRead *.man set filetype=xml

" Return to last edit position when opening files (You want this!)
autocmd BufReadPost *
     \ if line("'\"") > 0 && line("'\"") <= line("$") |
     \   exe "normal! g`\"" |
     \ endif
" Remember info about open buffers on close
set viminfo^=%

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => UI options
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
if has("gui_running")
  set cursorline cursorcolumn
" set guifont=Droid Sans Mono
  set guioptions=ic
  set guioptions+=e
  set guioptions+=r
  set guioptions+=b
  set lines=45
  set guitablabel=%F\ %t
else
  set nocursorline  nocursorcolumn
  set guioptions=ic
endif



