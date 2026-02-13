import type { FitEnum } from "sharp";

export type ExtractContent = {
    left: number | undefined;
    top: number | undefined;
    width: number;
    height: number;
};

export type ResizeContent = {
    width?: number;
    height?: number;
    background?: {
        r: number;
        g: number;
        b: number;
        alpha: number;
    } | undefined;
    fit?: keyof FitEnum | undefined,
    position?: "top" | "right top" | "right" | "right bottom" | "bottom" | "left bottom" | "left" | "left top" | undefined
};

export type ExtendContent = {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    background?: {
        r: number;
        g: number;
        b: number;
        alpha: number;
    } | undefined;
};

export type RotateContent = {
    degrees: number,
    background?: {
        r: number;
        g: number;
        b: number;
        alpha: number;
    } | undefined;
};

export type FormatContent = "png" | "jpeg" | "avif" | "webp";

export type AddInstructionType = {
    preExtract: ExtractContent,
    postExtract: ExtractContent,
    extract: ExtractContent,
    resize: ResizeContent,
    extend: ExtendContent,
    rotate: RotateContent,
    flip: boolean,
    flop: boolean,
    format: FormatContent,
    quality: number,
};

