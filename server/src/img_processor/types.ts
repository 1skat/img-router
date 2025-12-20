import z from "zod";

// Resizing map
export interface AspectRatioParams { wRatio?: number; hRatio?: number };
export interface ZoomParams { zoom?: number; x?: number; y?: number };
export interface BackgroundParams { r: number; g: number; b: number; alpha: number };
export interface PaddingParams { top?: number; left?: number; bottom?: number; right?: number };
export interface FitParams { fit: "contain" | "fill" | "inside" | "outside"; position?: string };
export interface PosType { x?: number, y?: number };

// Encoding map
export interface QualityParams { quality?: number };
export interface FormatParams { format?: string };

export const ResizeSchema = z.object({
    w: z.number().optional(),
    h: z.number().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    fit: z.object({
        mode: z.enum(["contain", "cover", "fill", "inside", "outside"]),
        position: z.enum(["top", "right top", "right", "right bottom", "bottom", "left bottom", "left", "left top"]).optional(),
    }).optional(),
    bg: z.object({
        r: z.number().min(0).max(255),
        g: z.number().min(0).max(255),
        b: z.number().min(0).max(255),
        alpha: z.number().min(0).max(1),
    }).optional()
});
export type ResizeType = z.infer<typeof ResizeSchema>;

export const ZoomSchema = z.object({
    z: z.number().min(1),
    vp: z.number().optional(),
    hp: z.number().optional(),
});
export type ZoomType = z.infer<typeof ZoomSchema>;

export const ExtractSchema = z.object({
    w: z.number().optional(),
    h: z.number().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
});
export type ExtractType = z.infer<typeof ExtractSchema>;

export type ImgStateFields = {
    preLeftOffset: number | null;
    preTopOffset: number | null;
    preWidth: number | null;
    preHeight: number | null;
    postLeftOffset: number | null;
    postTopOffset: number | null;
    postWidth: number | null;
    postHeight: number | null;
    rsWidth: number | null;
    rsHeight: number | null;
    origWidth: number;
    origHeight: number;
    aspectRatio: number;
};

export type StateMap = {
    [key: string]: (state: ImgStateFields, args: any) => void;
};

export type ArgsMap = {
    [key: string]: (args: any) => any;
};
