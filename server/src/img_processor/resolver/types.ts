import type { FitEnum } from "sharp";

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
};

export type StateMap = {
    [key: string]: (state: ImgStateFields, args: any) => void;
};
