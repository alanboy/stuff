set nocompatible
source $VIMRUNTIME/mswin.vim
behave mswin

" Use visual bell instead of beeping. The terminal code to display the
" visual bell is given with "t_vb". When no beep or flash is wanted,
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
set lazyredraw " Don't redraw while executing macros (good performance config) 

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
set statusline+=%5*\ %{&spelllang}\%{HighlightSearch()}\  "Spellanguage & Highlight on?
set statusline+=%8*\ %=\ row:%l/%L\ (%03p%%)\             "Rownumber/total (%)
set statusline+=%9*\ col:%03c\                            "Colnr
set statusline+=%0*\ \ %m%r%w\ %P\ \                      "Modified? Readonly? Top/bot.

function! HighlightSearch()
  if &hls
    return 'H'
  else
    return ''
  endif
endfunction

au WinLeave * set nocursorline nocursorcolumn
au WinEnter * set cursorline cursorcolumn

" Now when you open markdown files all fenced code blocks like so:
" "`javascript
" alert(0);
au BufNewFile,BufReadPost *.md set filetype=markdown
let g:markdown_fenced_languages = ["coffee", "css", "erb=eruby", "javascript", "js=javascript", "json=javascript", "ruby", "sass", "xml", "html"]

" set vim to chdir for each file
if exists("+autochdir")
  set autochdir
else
  autocmd BufEnter * silent! lcd %:p:h:gs/ /\ /
endif

au BufNewFile,BufRead *.man set filetype=xml
set path=$PWD\**
set runtimepath^=$VIMRUNTIME\..\bundle\ctrlp.vim

" tohtml
let html_use_css=1 "Use stylesheet instead of inline style
let html_number_lines=0 "don"t show line numbers
let html_no_pre=1

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
  set guifont=Lucida_Console:h12:cANSI
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


" Delete trailing white space on save, useful for Python and CoffeeScript ;)
func! DeleteTrailingWS()
  exe "normal mz"
  %s/\s\+$//ge
  exe "normal `z"
endfunc
autocmd BufWrite *.py :call DeleteTrailingWS()
autocmd BufWrite *.coffee :call DeleteTrailingWS()

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" => Helper functions
"""""""""""dvd"""""""""""""""""""""""""""""""""""""""""""""""""""

highlight right_diff guifg=#000000  guibg=#ffff66
"nnoremap <F8> :silent call GetDate('')<CR>
nnoremap <F8> : call GetDate()<CR>
function! GetDate()

    " Source Depot diff program must be diff.exe
    let $SDDIFF = 'diff.exe'

    " get the output of sd diff
    let cmd = 'sd diff ' . expand('%:p')
    let result = system(cmd)

    " is this file opened for change?
    if result =~ ".* file(s) not opened on this client."
         echo "not opened"
         return
    endif

    " it is openden. lets parse the diff output
    let result = substitute(result, '=.*=.', '', 'g')

    " after removint ===== filename ======, if its empty then
    " it is opened but it has no changes
    if result == ""
         echo "no changes"
        return
    endif

    let linestohighlight = []

    let splitparts = split(result, "\n")
    for line in splitparts

        "changed lines
        " look for lines that have changed:
        "  6c6
        "  25,26c25,26
        if line =~ '^[0-9]\+c[0-9]\+'
            let lineechanged = matchstr(line, '^[0-9]\+')
            call add(linestohighlight, lineechanged)
        endif

        "added lines
        if line =~ '^[0-9]\+a[0-9]\+'
            let lineechanged = matchstr(line, '^[0-9]\+')
            "echo "there is a change in line" . lineechanged
            call add(linestohighlight, lineechanged)
            "    " appended code looks like this: 22a23,29
            "    let appended = split(result, ",")
            "    let inserted_begin = split(appended[0], "a")[1]
            "    let inserted_end = appended[1]
            "    let hlquery = ''
            "    let c = inserted_begin
            "    while c <= inserted_end
            "        let hlquery = hlquery . ('\%' . c . 'l\|')
            "        let c += 1
            "    endwhile
        endif

    endfor

    let hlquery = ''
    for line in linestohighlight
        let hlquery = hlquery . ('\%' . line . 'l\|')
    endfor

    let hlquery = hlquery . 'foooooobar'
    call matchadd('right_diff', hlquery )

"    "clearmatches()
endfunction




au FileChangedRO * call SDCheckoutOpt ()

function SDCheckoutOpt ()
  if (confirm("Checkout", "&Yes\n&No", 1) == 1)
   silent call SDCheckout()
  endif
endfunction

let s:IgnoreChange=0

function SDCheckout ()
 let s:IgnoreChange=1
 silent! !sd edit %
 set noreadonly
endfunction

autocmd! FileChangedShell * silent call SDChanged()

function SDChanged ()
 if 1 == s:IgnoreChange
  let v:fcs_choice=""
  let s:IgnoreChange=0
 else
  let v:fcs_choice="ask"
 endif
endfunction

