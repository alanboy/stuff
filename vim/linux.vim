set nocompatible

" Use visual bell instead of beeping. The terminal code to display the
" visual bell is given with t_vb. When no beep or flash is wanted,
set vb t_vb=

" generic options
set background=light
set clipboard=unnamed
set expandtab
set guioptions=ic
set hlsearch
set ignorecase
set incsearch
set list
set listchars=tab:>-,trail:~,eol:$,precedes:<,nbsp:+
set nobackup
set noswapfile
set nowrap
set number
set scrolloff=5 " whats this?
set scrolloff=5 " whats this?
set sessionoptions+=resize,winpos
set shiftwidth=4
set shiftwidth=4
set smartcase
set splitright " whats this ?
set tabstop=4
set wildmenu

 colo desert

 " set vim to chdir for each file
 "if exists(+autochdir)
 "set autochdir
 "else
 "autocmd BufEnter * silent! lcd %:p:h:gs/ /\ /
 "endif

 au BufNewFile,BufRead *.man set filetype=xml
 set path=$PWD\**
 "set runtimepath^=$VIMRUNTIME/plugin/ctrlp.vim
 set runtimepath^=~/.vim/ctrlp.vim

 "  tohtml
 let html_use_css=1 "Use stylesheet instead of inline style
 let html_number_lines=0 "dont show line numbers
 let html_no_pre=1

if has("gui_running")
" set guifont=Droid Sans Mono
 set lines=45
 set guioptions+=r
 set cursorline cursorcolumn
" au WinLeave * set nocursorline nocursorcolumn
" au WinEnter * set cursorline cursorcolumn
else
 set nocursorline  nocursorcolumn
endif



