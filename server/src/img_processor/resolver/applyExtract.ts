import type { ImgStateFields } from "./image_state";

export function applyExtract(
    state: ImgStateFields,
    { width, height, x, y }: { width: number, height: number, x: number, y: number }) {

    state.preWidth = state.preWidth ?? (!state.rsWidth ? width : null);
    state.postWidth = (state.preWidth && state.rsWidth) ? width : null;
    state.preHeight = state.preHeight ?? (!state.rsHeight ? height : null);
    state.postHeight = (state.preHeight && state.rsHeight) ? height : null;

    state.preLeftOffset = state.preLeftOffset ?? (!state.rsWidth ? x : null);
    state.postLeftOffset = (state.preLeftOffset && state.rsWidth) ? x : null;
    state.preTopOffset = state.preTopOffset ?? (!state.rsWidth ? y : null);
    state.postTopOffset = (state.preTopOffset && state.rsWidth) ? y : null;
};

export function applyResize(
    state: ImgStateFields,
    { width, height }: { width?: number, height?: number }) {

    if (width) state.rsWidth = width;
    if (height) state.rsHeight = height;
};
