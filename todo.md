resize is the prisma through which the image is seen
extract is what cuts a part of the image and can get rotated

<!-- 0. make isRotated - checks the angle
1. rotateBefore assign during:
    * resize: 1. rotateExpected (so it came before) && 2. resizeExpected (rsWidth,rsHeight are set)
    * extract: 1. rotateExpected (so it came before) && noResize && at least one extract is not set -->
    

0. Resize + (x/y):
    a. preExtact -> resize:
        * now the new aspect ratio now is preExtract's area e.g 800x350 
        * if addinng resize 700x100, then you can find SCALE and calculate the max image's area - 700x306.
        * if applying x/y, here the availabe height is 306-100=206px
        
1. "const scale = Math.max(width / origW, height / origH); // find scale of the unconsrained side"
    * not the original width but the current wdith/height: e.g preResized since it what the resize will be placed on






