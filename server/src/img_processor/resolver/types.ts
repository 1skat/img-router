import type { FitEnum } from "sharp";
import type { ImageState } from "./state";

export type ImgStateFields = {
    preLeftOffset: number;
    preTopOffset: number;
    preWidth: number;
    preHeight: number;
    postLeftOffset: number;
    postTopOffset: number;
    postWidth: number;
    postHeight: number;
    rsWidth: number;
    rsHeight: number;
    rsFit: keyof FitEnum | undefined,
    rsPosition: "top" | "right top" | "right" | "right bottom" | "bottom" | "left bottom" | "left" | "left top" | undefined;
    rsBackground: {
        r: number;
        g: number;
        b: number;
        alpha: number;
    } | undefined;
    origWidth: number;
    origHeight: number;
    extendTop: number | undefined;
    extendBottom: number | undefined;
    extendLeft: number | undefined;
    extendRight: number | undefined;
    extendBackground: {
        r: number;
        g: number;
        b: number;
        alpha: number;
    } | undefined;
    rotateAngle: number;
    rotateBefore: boolean;
    rotateBackground: {
        r: number;
        g: number;
        b: number;
        alpha: number;
    } | undefined;
    flip: boolean,
    flop: boolean,
    formatOut: "png" | "jpeg" | "avif" | "webp" | undefined,
    formatQuality: number | undefined,
    isZoomed: boolean,
};

export type StateMap = {
    [key: string]: (state: ImageState, args: any) => void;
};

type SupportedImageFormat =
    | "webp"
    | "avif"
    | "png"
    | "jpeg"

export type UserSettings = {
    format: SupportedImageFormat,
    quality: number,
};

