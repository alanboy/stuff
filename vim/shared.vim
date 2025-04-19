" Auto-reload Vim configuration when saved
augroup auto_reload_vim_config
  autocmd!
  autocmd BufWritePost *.vim source %
  autocmd BufWritePost $MYVIMRC source $MYVIMRC
augroup END

set nocompatible
set vb t_vb=                " Visual bell with no beep or flash
" set lazyredraw              " Don't redraw while executing macros (good performance config)
set autoread                      " Automatically read file when changed outside of Vim
set clipboard=unnamed             " Use system clipboard for copy/paste operations
set expandtab                     " Use spaces instead of tabs
set tabstop=4                     " Number of spaces a tab counts for
set hlsearch                      " Highlight all matches when searching
set ignorecase                    " Ignore case in search patterns
set incsearch                     " Show matches as you type search pattern
set list                          " Show invisible characters
set listchars=tab:>-,trail:~,eol:$,precedes:<,nbsp:+  " Define how invisible chars appear
set nobackup                      " Don't create backup files
set noswapfile                    " Don't create swap files
set nowrap                        " Don't wrap lines
set number                        " Show line numbers
set sessionoptions+=resize,winpos " Save window size and position in sessions
set shiftwidth=4                  " Number of spaces for each step of indent
" set scrolloff=5 " Set 5 lines to the cursor - when moving vertically using j/k
" set smartcase               " Override ignorecase when pattern has uppercase
" set splitright              " New vertical splits open to the right of current window
" set wildmenu                " Enhanced command-line completion in menu
syntax enable

""""" :command WQ wq             " Allow typing WQ to save and quit (handles uppercase typo)
""""" :command Wq wq             " Allow typing Wq to save and quit (handles mixed case typo)
""""" :command W w               " Allow typing W to save (handles uppercase typo)
""""" :command Q q               " Allow typing Q to quit (handles uppercase typo)

colo darkblue



""""" """"""""""""""""""""""""""""""""""""""""""""""""
""""" " => Status line
""""" """"""""""""""""""""""""""""""""""""""""""""""""
"hi User0 guifg=#ffffff  guibg=#094afe
""""" hi User1 guifg=#ffdad8  guibg=#880c0e
hi User2 guifg=#000000  guibg=#F4905C
hi User3 guifg=#292b00  guibg=#f4f597
hi User4 guifg=#112605  guibg=#aefe7B
""""" hi User5 guifg=#051d00  guibg=#7dcc7d
hi User7 guifg=#ffffff  guibg=#880c0e gui=bold
""""" hi User8 guifg=#ffffff  guibg=#5b7fbb
""""" hi User9 guifg=#ffffff  guibg=#810085

hi User5 guifg=#00FF00 guibg=#333333 ctermfg=green ctermbg=236    " Define custom highlight group for Codeium status


""""" " maybe add some colors to console later, like this:
""""" "hi User1 ctermbg=green ctermfg=red   guibg=green guifg=red
""""" "hi User2 ctermbg=red   ctermfg=blue  guibg=red   guifg=blue
""""" "hi User3 ctermbg=blue  ctermfg=green guibg=blue  guifg=green

set laststatus=2
set statusline=
set statusline+=%7*\[%n]                                  "buffernr
set statusline+=%1*\ %<%F\                                "File+path
"set statusline+=%2*\ %y\                                  "FileType

set statusline+=%3*\ %{''.(&fenc!=''?&fenc:&enc).''}      "Encoding
"set statusline+=%3*\ %{(&bomb?\",BOM\":\"\")}\            "Encoding2

set statusline+=%5*\ ✨%{codeium#GetStatusString()}      "Codeium status

set statusline+=%4*\ %{&ff}\                              "FileFormat (dos/unix..)
"set statusline+=%5*\ %{&spelllang}\                       "Spellanguage & Highlight on?

set statusline+=%8*\ %=\ row:%l/%L\ (%03p%%)\             "Rownumber/total (%)
set statusline+=%9*\ col:%03c\                            "Column location

set statusline+=%0*\ \ %m%r%w\ %P\ \                      "Modified? Readonly? Top/bot.



""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => UI options
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
if has("gui_running")

  "set lines=70
  "set columns=126
  "winpos 1 1

  " Read more: https://www.linux.com/learn/using-spell-checking-vim
  "  :setlocal spell spelllang=en_us

  " Show a cursor line for the row and column
  set cursorline cursorcolumn

  " Custom highlighting for cursor line and column with darkblue scheme
  " Light gray background for cursor line
  highlight CursorLine guibg=#3F00FF ctermbg=236
  " Darker background for cursor column
  highlight CursorColumn guibg=#3F00FF ctermbg=234

  "Together, these commands would create a visual effect where the current cursor
  "position is highlighted with both a horizontal and vertical line (creating a
  "crosshair" effect) only in the active window
  au WinLeave * set nocursorline nocursorcolumn
  au WinEnter * set cursorline cursorcolumn

  set guioptions=ic        " i: use Vim icon, c: use console dialogs instead of popup dialogs
  """""   set guioptions+=r        " r: show right scrollbar when split vertically
  """""   set guioptions+=b        " b: show bottom scrollbar when split horizontally
  """""   set lines=45             " sets the number of lines in the Vim window to 45
  """""   set guitablabel=%F       " %F: show full path of the file in the tab label
  set guifont=Consolas:h13 " sets the GUI font to Consolas with size 13
  """""   "set guitablabel=%F\ %t  " alternative tab label format with full path and filename

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

""""" nnoremap <F7> : %s/\\r\\n/\r/<CR>   " Replace Windows line endings (CRLF) with Unix line endings (LF) in normal mode
""""" inoremap <F9> <C-O>za                " Toggle fold under cursor while in insert mode
""""" onoremap <F9> <C-C>za                " Toggle fold in operator-pending mode
""""" vnoremap <F9> zf                     " Create a new fold from the selected text in visual mode

" Function to cycle through color schemes
let g:mycolors = ['blue', 'darkblue', 'default', 'delek', 'desert', 'elflord', 'evening', 'industry', 'koehler', 'morning', 'murphy', 'pablo', 'peachpuff', 'ron', 'shine', 'slate', 'torte', 'zellner']
let g:mycolors_index = 0

function! CycleColorScheme()
  let g:mycolors_index = (g:mycolors_index + 1) % len(g:mycolors)
  execute 'colorscheme ' . g:mycolors[g:mycolors_index]
  echo 'Color scheme: ' . g:mycolors[g:mycolors_index]
endfunction

" Map F9 to cycle through color schemes
nnoremap <F9> :call CycleColorScheme()<CR>

" Old/legacy  configurations:
""""" au BufNewFile,BufRead *.man set filetype=xml

""""" " to html
""""" let html_use_css=1 "Use stylesheet instead of inline style
""""" let html_number_lines=0 "don't show line numbers
""""" let html_no_pre=1

