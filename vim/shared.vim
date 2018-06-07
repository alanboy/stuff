;;

set nocompatible

" Use visual bell instead of beeping.
set vb t_vb=

set lazyredraw " Don't redraw while executing macros (good performance config)
set autoread
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

:command WQ wq
:command Wq wq
:command W w
:command Q q

colo desert
syntax enable

au WinLeave * set nocursorline nocursorcolumn
au WinEnter * set cursorline cursorcolumn

au BufNewFile,BufRead *.man set filetype=xml

" to html
let html_use_css=1 "Use stylesheet instead of inline style
let html_number_lines=0 "don't show line numbers
let html_no_pre=1

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
set statusline+=%5*\ %{&spelllang}\                       "Spellanguage & Highlight on?
"set statusline+=%5*\ %{&spelllang}\%{HighlightSearch()}\  "Spellanguage & Highlight on?
set statusline+=%8*\ %=\ row:%l/%L\ (%03p%%)\             "Rownumber/total (%)
set statusline+=%9*\ col:%03c\                            "Colnr
set statusline+=%0*\ \ %m%r%w\ %P\ \                      "Modified? Readonly? Top/bot.

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => UI options
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
if has("gui_running")
  set cursorline cursorcolumn
  set guioptions=ic
  set guioptions+=r
  set guioptions+=b
  set lines=45
  set guitablabel=%F
  set guifont=Consolas:h13
  "set guitablabel=%F\ %t
  " Change font with Ctrl Up/Down
  nmap <C-Up> :let &guifont = substitute(&guifont, ':h\(\d\+\)', '\=":h" . (submatch(1) + 1)', '')<CR><CR>
  nmap <C-Down> :let &guifont = substitute(&guifont, ':h\(\d\+\)', '\=":h" . (submatch(1) - 1)', '')<CR><CR>
else
  set nocursorline  nocursorcolumn
  set guioptions=ic
endif


" Return to last edit position when opening files (You want this!)
autocmd BufReadPost *
     \ if line("'\"") > 0 && line("'\"") <= line("$") |
     \   exe "normal! g`\"" |
     \ endif
" Remember info about open buffers on close
set viminfo^=%



" Delete trailing white space on save, useful for Python and CoffeeScript ;)
func! DeleteTrailingWS()
  exe "normal mz"
  %s/\s\+$//ge
  exe "normal `z"
endfunc

nnoremap <F8> : call DeleteTrailingWS()<CR>
