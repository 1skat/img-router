import type { ImgStateFields } from "../image_state";

export function applyExtract(
    state: ImgStateFields,
    { left, top, width, height }: { left: number; top: number, width: number; height: number; }
) {
    state.preLeftOffset = state.preLeftOffset ?? ((!state.rsWidth && !state.rsHeight) ? left : null);
    state.preTopOffset = state.preTopOffset ?? ((!state.rsWidth && !state.rsHeight) ? top : null);

    state.preWidth = state.preWidth ?? ((!state.rsWidth && !state.rsHeight) ? width : null);
    state.preHeight = state.preHeight ?? ((!state.rsWidth && !state.rsHeight) ? height : null);

    state.postLeftOffset = (state.rsWidth || state.rsHeight) ? left : null;
    state.postTopOffset = (state.rsWidth || state.rsHeight) ? top : null;

    state.postWidth = (state.rsWidth || state.rsHeight) ? width : null;
    state.postHeight = (state.rsWidth || state.rsHeight) ? height : null;
};

export function applyResize(
    state: ImgStateFields,
    { width, height }: { width?: number, height?: number }) {

    if (width) state.rsWidth = width;
    if (height) state.rsHeight = height;
};
