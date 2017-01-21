source $VIMRUNTIME\..\shared.vim

source $VIMRUNTIME/mswin.vim

behave mswin

" set vim to chdir for each file, do i want this?
if exists("+autochdir")
  set autochdir
else
  autocmd BufEnter * silent! lcd %:p:h:gs/ /\ /
endif

""" " to html
""" let html_use_css=1 "Use stylesheet instead of inline style
""" let html_number_lines=0 "don't show line numbers
""" let html_no_pre=1
""" 
""" au BufNewFile,BufRead *.man set filetype=xml
""" set path=$PWD\**
""" 
""" " Return to last edit position when opening files (You want this!)
""" autocmd BufReadPost *
"""      \ if line("'\"") > 0 && line("'\"") <= line("$") |
"""      \   exe "normal! g`\"" |
"""      \ endif
""" " Remember info about open buffers on close
""" set viminfo^=%

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" CtrlP plugin
" @todo open all files in new tab
set path=$PWD\**
"
""" set runtimepath^=$VIMRUNTIME\..\bundle\ctrlp.vim
""" let g:ctrlp_working_path_mode = 'r'
""" let g:ctrlp_root_markers = ['wcp', 'cbs']
""" 
set runtimepath^=$VIMRUNTIME\..\bundle\nerdtree
""" 
""" 
""" " Delete trailing white space on save, useful for Python and CoffeeScript ;)
""" func! DeleteTrailingWS()
"""   exe "normal mz"
"""   %s/\s\+$//ge
"""   exe "normal `z"
""" endfunc
""" autocmd BufWrite *.py :call DeleteTrailingWS()
""" autocmd BufWrite *.coffee :call DeleteTrailingWS()

"" if has("gui_running")
""   set cursorline cursorcolumn
""   set guifont=Lucida_Console:h12:cANSI
""   set lines=45
""   set guitablabel=%F\ %t
""   " Change font with Ctrl Up/Down
""   nmap <C-Up> :let &guifont = substitute(&guifont, ':h\(\d\+\)', '\=":h" . (submatch(1) + 1)', '')<CR><CR>
""   nmap <C-Down> :let &guifont = substitute(&guifont, ':h\(\d\+\)', '\=":h" . (submatch(1) - 1)', '')<CR><CR>
"" 
""   "set guioptions=ic
""   "set guioptions+=e
""   "set guioptions+=r
""   "set guioptions+=b
""   set guioptions=icpM
""   if has('win32') || has('win64')
""     if (v:version == 704 && has("patch393")) || v:version > 704
""         set renderoptions=type:directx,level:0.75,gamma:1.25,contrast:0.25,
""                     \geom:1,renmode:5,taamode:1
""     endif
""   endif
"" 
"" else
""   set nocursorline  nocursorcolumn
""   set guioptions=ic
"" endif
"" 
"" 
"" " Delete trailing white space on save, useful for Python and CoffeeScript ;)
"" func! DeleteTrailingWS()
""   exe "normal mz"
""   %s/\s\+$//ge
""   exe "normal `z"
"" endfunc
"" autocmd BufWrite *.py :call DeleteTrailingWS()
"" autocmd BufWrite *.coffee :call DeleteTrailingWS()
"" 

"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" Highlight changes from file in source control.
" Only works with source depot. 
"
highlight right_diff guifg=#000000  guibg=#ffff66
nnoremap <F8> : call HighlightDiff()<CR>
function! HighlightDiff()

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


""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" When editing a file that is RO, try to sd edit
au FileChangedRO * call SDCheckoutOpt ()

function SDCheckoutOpt ()
  if (confirm("sd checkout", "&Yes\n&No", 1) == 1)
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

