import type { ImgStateFields } from "@/img_processor/resolver/types"
import { is, get } from "@/img_processor/resolver/helpers";
import type sharp from "sharp";

export function applyPreExtract(
    state: ImgStateFields,
    { left, top, width, height }: { left: number; top: number, width: number; height: number; }
) {
    state.preLeftOffset = left ?? -1;
    state.preTopOffset = top ?? -1;
    state.preWidth = width ?? -1;
    state.preHeight = height ?? -1;
};

export function applyPostExtract(
    state: ImgStateFields,
    { left, top, width, height }: { left: number; top: number, width: number; height: number; }
) {
    console.log(left, top, width, height);
    state.postLeftOffset = left ?? -1;
    state.postTopOffset = top ?? -1;
    state.postWidth = width ?? -1;
    state.postHeight = height ?? -1;
};

export function applyExtract(
    state: ImgStateFields,
    { left, top, width, height }: { left: number; top: number, width: number; height: number; }
) {
    const l = left ?? -1;
    const t = top ?? -1;
    const w = width ?? -1;
    const h = height ?? -1;

    const hasResize = is.set(state.rsWidth) && is.set(state.rsHeight);

    // Pre
    state.preLeftOffset = get.ifSet(state.preLeftOffset) ?? (!hasResize ? l : -1);
    state.preTopOffset = get.ifSet(state.preTopOffset) ?? (!hasResize ? t : -1);
    state.preWidth = get.ifSet(state.preWidth) ?? (!hasResize ? w : -1);
    state.preHeight = get.ifSet(state.preHeight) ?? (!hasResize ? h : -1);

    // Post
    state.postLeftOffset = hasResize ? l : -1;
    state.postTopOffset = hasResize ? t : -1;
    state.postWidth = hasResize ? w : -1;
    state.postHeight = hasResize ? h : -1;
};

export function applyResize(
    state: ImgStateFields,
    opts: sharp.ResizeOptions,
) {
    state.rsWidth = opts.width ?? -1;
    state.rsHeight = opts.height ?? -1;
};
