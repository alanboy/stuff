set nocompatible
"source $VIMRUNTIME/vimrc_example.vim
""source $VIMRUNTIME/mswin.vim
""behave mswin

" Use visual bell instead of beeping. The terminal code to display the
" " visual bell is given with t_vb. When no beep or flash is wanted,
"
 set vb t_vb=
 au WinLeave * set nocursorline nocursorcolumn
 au WinEnter * set cursorline cursorcolumn


 "  generic options
 set background=light
 set clipboard=unnamed
 set expandtab
 set guioptions=ic
 set hlsearch
 set ic
 set ignorecase
 set incsearch
 set list
 "set listchars=tab:>-,trail:~,eol:,precedes:<,nbsp:+
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

 " Now when you open markdown files all fenced code blocks like so:
 " `javascript
 " alert(0);
 "au BufNewFile,BufReadPost *.md set filetype=markdown
 "let g:markdown_fenced_languages = [coffee, css, erb=eruby, javascript,
 js=javascript, json=javascript, ruby, sass, xml, html]

 " set vim to chdir for each file
 "if exists(+autochdir)
 "set autochdir
 "else
 "autocmd BufEnter * silent! lcd %:p:h:gs/ /\ /
 "endif

 au BufNewFile,BufRead *.man set filetype=xml
 set path=$PWD\**
 set runtimepath^=$VIMRUNTIME/plugin/ctrlp.vim

 "  tohtml
 let html_use_css=1 "Use stylesheet instead of inline style
 let html_number_lines=0 "dont show line numbers
 let html_no_pre=1

 "  gui
 "if has(gui_running)
 "set guifont=Lucida_Console:h12:cANSI
 "set lines=45
 "set guioptions+=r
 "endif
 "

 set cursorline cursorcolumn
 colo blue
 vagrant@vagrant-ubuntu-vivid-64:/opt/omegaup/frontend/templates$

