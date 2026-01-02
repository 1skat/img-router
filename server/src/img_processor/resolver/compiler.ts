import sharp from "sharp";
import type { TransformationResolver } from "./resolver";
import { ImageState } from "./state";
import { get } from "./helpers";

type SharpContentTypes = {
    rotate: [number, sharp.RotateOptions],
    resize: [sharp.ResizeOptions],
    extract: [sharp.Region],
    extend: [sharp.ExtendOptions],
};

type SharpInstr = {
    [K in keyof SharpContentTypes]: {
        method: K,
        content: SharpContentTypes[K],
    }
}[keyof SharpContentTypes];

export function compile(img: ImageState) {
    const sharpInstructions: SharpInstr[] = [];

    if (img.state.rotateBefore && img.isRotated) {
        sharpInstructions.push({
            method: "rotate",
            content: [
                img.state.rotateAngle,
                { background: img.state.rotateBackground }
            ],
        });
    };
    if (img.isPreExtracted) {
        sharpInstructions.push({
            method: "extract",
            content: [{
                left: get.ifSet(img.state.preLeftOffset) ?? 0,
                top: get.ifSet(img.state.preTopOffset) ?? 0,
                width: img.state.preWidth,
                height: img.state.preHeight,
            }]
        });
    };
    if (img.isRsized) {
        sharpInstructions.push({
            method: "resize",
            content: [{
                width: img.state.rsWidth,
                height: img.state.rsHeight,
                fit: img.state.rsFit,
                position: img.state.rsPosition,
                background: img.state.rsBackground,
            }]
        });
    };
    if (img.isPostExtracted) {
        sharpInstructions.push({
            method: "extract",
            content: [{
                left: get.ifSet(img.state.postLeftOffset) ?? 0,
                top: get.ifSet(img.state.postTopOffset) ?? 0,
                width: img.state.postWidth,
                height: img.state.postHeight,
            }],
        });
    };
    if (!img.state.rotateBefore && img.isRotated) {
        sharpInstructions.push({
            method: "rotate",
            content: [
                img.state.rotateAngle,
                { background: img.state.rotateBackground }
            ],
        });
    };
    if (img.isExtended) {
        sharpInstructions.push({
            method: "extend", content: [{
                top: img.state.extendTop,
                bottom: img.state.extendBottom,
                left: img.state.extendLeft,
                right: img.state.extendRight,
                background: img.state.extendBackground,
            }]
        });
    };

    if (img.isRotated) {

    }

    return sharpInstructions;
};



