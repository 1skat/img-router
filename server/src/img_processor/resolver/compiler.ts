import type sharp from "sharp";
import type { TransformationResolver } from "./resolver";
import type { ImageState } from "./state";
import { get } from "./helpers";

export function compile(img: ImageState) {
    const sharpInstructions: { method: string, content: any }[] = [];

    if (img.isPreExtracted) {
        const method = "extract";
        const content: sharp.Region = {
            left: get.ifSet(img.state.preLeftOffset) ?? 0,
            top: get.ifSet(img.state.preTopOffset) ?? 0,
            width: img.state.preWidth,
            height: img.state.preHeight,
        };
        sharpInstructions.push({ method, content });
    };
    if (img.isRsized) {
        const method = "resize";
        const content: sharp.ResizeOptions = {
            width: img.state.rsWidth,
            height: img.state.rsHeight,
            fit: img.state.rsFit,
            position: img.state.rsPosition,
            background: img.state.rsBackground,
        };
        sharpInstructions.push({ method, content });
    };
    if (img.isPostExtracted) {
        const method = "extract";
        const content: sharp.Region = {
            left: get.ifSet(img.state.postLeftOffset) ?? 0,
            top: get.ifSet(img.state.postTopOffset) ?? 0,
            width: img.state.postWidth,
            height: img.state.postHeight,
        };
        sharpInstructions.push({ method, content });
    };
    if (img.isExtended) {
        const method = "extend";
        const content: sharp.ExtendOptions = {
            top: img.state.extendTop,
            bottom: img.state.extendBottom,
            left: img.state.extendLeft,
            right: img.state.extendRight,
            background: img.state.extendBackground,
        };

        sharpInstructions.push({ method, content });
    };

    return sharpInstructions;
};



