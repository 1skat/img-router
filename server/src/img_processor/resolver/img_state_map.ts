import { applyExtract, applyResize } from "./applyExtract";
import type { ImgStateFields } from "./image_state";

type StateMap = {
    [key: string]: (state: ImgStateFields, args: any) => void;
};

export const imageStateMap: StateMap = { // add type 
    resize: applyResize,
    extract: applyExtract,
};
