let mapleader = "\<Space>"
let maplocalleader = "\<Space>"

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
set statusline+=%8*\ %=\ row:%l/%L\ (%03p%%)\             "Rownumber/total (%)
set statusline+=%9*\ col:%03c\                            "Colnr
set statusline+=%0*\ \ %m%r%w\ %P\ \                      "Modified? Readonly? Top/bot.

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => UI options
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" I think this does not work on MAC
if has("gui_running")

  " Read more: https://www.linux.com/learn/using-spell-checking-vim
  :setlocal spell spelllang=en_us

  set cursorline cursorcolumn
  set guioptions=ic
  set guioptions+=r
  set guioptions+=b
  set lines=45
  set guitablabel=%F
  set guifont=Consolas:h13
  "set guitablabel=%F\ %t
  " Change font with Ctrl Up/Down
else
  set nocursorline  nocursorcolumn
  set guioptions=ic
endif


nmap <Leader-Left> :echo "hi"<CR>
nmap <Leader-Up> :let &guifont = substitute(&guifont, ':h\(\d\+\)', '\=":h" . (submatch(1) + 1)', '')<CR><CR>
nmap <Leader-Down> :let &guifont = substitute(&guifont, ':h\(\d\+\)', '\=":h" . (submatch(1) - 1)', '')<CR><CR>

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
nnoremap <F7> : %s/\\r\\n/\r/<CR>


inoremap <F9> <C-O>za
nnoremap <F9> za
onoremap <F9> <C-C>za
vnoremap <F9> zf

set path=$PWD\**

" https://www.johnhawthorn.com/2012/09/vi-escape-delays/
" While having a vim discussion on twitter with @_jaredn,
" I remembered that having a delay in entering normal mode 
" after pressing ESC (switching to normal mode) really frustrates me. 
" This delay exists because many keys (arrows keys, ALT)
" rely on it as an escape character. Here's the setup I've 
" used for a while for near instantaneous switch into normal mode.
set timeoutlen=1000 ttimeoutlen=0


