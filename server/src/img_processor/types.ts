import z from "zod";

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

export const AspectRatioSchema = z.object({
    w: z.number(),
    h: z.number(),
    fit: z.enum(["w", "h"]).default("w")
});
export type AspectRatioType = z.infer<typeof AspectRatioSchema>;

export const PaddingSchema = z.object({
    px: z.number().min(1),
    side: z.object({
        left: z.boolean().optional(),
        top: z.boolean().optional(),
        bottom: z.boolean().optional(),
        right: z.boolean().optional(),
    }).optional(),
    bg: z.object({
        r: z.number().min(0).max(255),
        g: z.number().min(0).max(255),
        b: z.number().min(0).max(255),
        alpha: z.number().min(0).max(1),
    }).optional(),
});
export type PaddingType = z.infer<typeof PaddingSchema>;

export const RotateSchema = z.object({
    degrees: z.number().min(-356).max(360),
    bg: z.object({
        r: z.number().min(0).max(255),
        g: z.number().min(0).max(255),
        b: z.number().min(0).max(255),
        alpha: z.number().min(0).max(1),
    }).optional(),
});
export type RotateType = z.infer<typeof RotateSchema>;

export const QualitySchema = z.object({
    num: z.number().min(10).max(100).default(80),
});
export type QualityType = z.infer<typeof QualitySchema>;

export const FormatSchema = z.object({
    ext: z.enum(["png", "jpeg", "avif", "webp"]),
});
export type FormatType = z.infer<typeof FormatSchema>;
