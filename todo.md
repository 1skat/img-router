0. Minimum abstactions

<!-- 0. Resize + (x/y):
    a. preExtact -> resize:
        * now the new aspect ratio now is preExtract's area e.g 800x350 
        * if addinng resize 700x100, then you can find SCALE and calculate the max image's area - 700x306.
        * if applying x/y, here the availabe height is 306-100=206px
        
1. "const scale = Math.max(width / origW, height / origH); // find scale of the unconsrained side"
    * not the original width but the current wdith/height: e.g preResized since it what the resize will be placed on -->
