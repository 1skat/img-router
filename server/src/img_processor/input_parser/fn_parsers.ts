import { AspectRatioSchema, ExtractSchema, FormatSchema, PaddingSchema, QualitySchema, ResizeSchema, RotateSchema, ZoomSchema } from "@/img_processor/types";
import type z from "zod";
import { parseImgFuncArgs } from "./utils/parse_func_args";

export const resizeParameters = {
    extr: { methodKey: "extract", group: "resizing", parser: createParser("extract", ExtractSchema) },
    rs: { methodKey: "resize", group: "resizing", parser: createParser("resize", ResizeSchema) },
    z: { methodKey: "zoom", group: "resizing", parser: createParser("zoom", ZoomSchema) },
    ar: { methodKey: "aspectRatio", group: "resizing", parser: createParser("aspectRatio", AspectRatioSchema) },
    pad: { methodKey: "padding", group: "resizing", parser: createParser("padding", PaddingSchema) },
    rt: { methodKey: "rotate", group: "resizing", parser: createParser("rotate", RotateSchema) },
    flip: { methodKey: "flip", group: "resizing", parser: () => true },
    flop: { methodKey: "flop", group: "resizing", parser: () => true },
};

export const encodingParameters = {
    q: { methodKey: "quality", group: "encoding", parser: createParser("quality", QualitySchema) },
    f: { methodKey: "format", group: "encoding", parser: createParser("format", FormatSchema) },
};

function createParser<T>(name: string, schema: z.ZodSchema<T>) {
    return (data: string) => {
        if (!data.trim()) throw new Error(`${name}: parameter required`);
        const extracted = parseImgFuncArgs(data, name);
        return schema.parse(extracted);
    };
};
