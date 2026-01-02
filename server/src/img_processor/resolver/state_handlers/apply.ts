import type { ImgStateFields } from "@/img_processor/resolver/types"
import { is, get } from "@/img_processor/resolver/helpers";
import type sharp from "sharp";
import type { ExtendContent, ExtractContent, ResizeContent, RotateContent } from "./types";
import type { ImageState } from "../state";

export function applyPreExtract(
    img: ImageState,
    { left, top, width, height }: { left: number; top: number, width: number; height: number; }
) {
    img.state.preLeftOffset = left ?? -1;
    img.state.preTopOffset = top ?? -1;
    img.state.preWidth = width ?? -1;
    img.state.preHeight = height ?? -1;
};

export function applyPostExtract(
    img: ImageState,
    { left, top, width, height }: { left: number; top: number, width: number; height: number; }
) {
    img.state.postLeftOffset = left ?? -1;
    img.state.postTopOffset = top ?? -1;
    img.state.postWidth = width ?? -1;
    img.state.postHeight = height ?? -1;
};

export function applyExtract(
    img: ImageState,
    { left, top, width, height }: { left: number; top: number, width: number; height: number; }
) {
    const l = left ?? -1;
    const t = top ?? -1;
    const w = width ?? -1;
    const h = height ?? -1;

    const hasResize = img.isRsized;

    // Pre
    img.state.preLeftOffset = get.ifSet(img.state.preLeftOffset) ?? (!hasResize ? l : -1);
    img.state.preTopOffset = get.ifSet(img.state.preTopOffset) ?? (!hasResize ? t : -1);
    img.state.preWidth = get.ifSet(img.state.preWidth) ?? (!hasResize ? w : -1);
    img.state.preHeight = get.ifSet(img.state.preHeight) ?? (!hasResize ? h : -1);

    // Post
    img.state.postLeftOffset = hasResize ? l : -1;
    img.state.postTopOffset = hasResize ? t : -1;
    img.state.postWidth = hasResize ? w : -1;
    img.state.postHeight = hasResize ? h : -1;

    // rotate AND not resized AND at least one extraction is not set yet
    if (img.isRotated && !img.isRsized) {
        if (!img.isPreExtracted || !img.isPostExtracted) {
            img.state.rotateBefore = true;
        };
    };
}

export function applyResize(
    img: ImageState,
    opts: ResizeContent,
) {
    img.state.rsWidth = opts.width ?? -1;
    img.state.rsHeight = opts.height ?? -1;
    img.state.rsFit = opts.fit;
    img.state.rsPosition = opts.position;
    img.state.rsBackground = opts.background;

    if (img.isRsized && img.isRotated) img.state.rotateBefore = true;
};

export function applyExtend(
    img: ImageState,
    opts: ExtendContent,
) {
    img.state.extendTop = opts.top;
    img.state.extendBottom = opts.bottom;
    img.state.extendLeft = opts.left;
    img.state.extendRight = opts.right;
    img.state.extendBackground = opts.background;
};

export function applyRotate(
    img: ImageState,
    opts: RotateContent,
) {
    img.state.rotateAngle = opts.degrees;
    img.state.rotateBackground = opts.background;
};
