source $VIMRUNTIME/shared.vim

set path=$PWD\**

" https://www.johnhawthorn.com/2012/09/vi-escape-delays/
" While having a vim discussion on twitter with @_jaredn, I remembered that having a delay in entering normal mode after pressing ESC (switching to normal mode) really frustrates me. This delay exists because many keys (arrows keys, ALT) rely on it as an escape character. Here’s the setup I’ve used for a while for near instantaneous switch into normal mode.
set timeoutlen=1000 ttimeoutlen=0

