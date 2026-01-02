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
};

export type StateMap = {
    [key: string]: (state: ImageState, args: any) => void;
};

