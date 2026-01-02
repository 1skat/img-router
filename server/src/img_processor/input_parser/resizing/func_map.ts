import tinycolor from "tinycolor2";
import { functionHandlers } from "./func_options";
import { tryCatch } from "@/utils/try-catch";
import z from "zod";
import { parseImgFuncArgs } from "../utils/parse_func_args";
import { AspectRatioSchema, ExtractSchema, PaddingSchema, ResizeSchema, RotateSchema, ZoomSchema } from "@/img_processor/types";

export const resizeParameters = {
    extr: {
        k: "extract",
        parser: extractParser,
    },
    rs: {
        k: "resize",
        parser: resizeParser,
    },
    z: {
        k: "zoom",
        parser: zoomParser,
    },
    ar: {
        k: "aspectRatio",
        parser: aspectRatioParser,
    },
    pad: {
        k: "padding",
        parser: paddingParser,
    },
    rt: {
        k: "rotate",
        parser: rotateParser,
    },
};

function extractParser(data: string) {
    if (!data.trim()) throw new Error("parameter required after `extr`");
    const extracted = parseImgFuncArgs(data, "extract");

    return ExtractSchema.parse(extracted);
};

function resizeParser(data: string) {
    if (!data.trim()) throw new Error("resizeParser: parameter required after `rs`");
    const extracted = parseImgFuncArgs(data, "resize");

    return ResizeSchema.parse(extracted);
};

function zoomParser(data: string) {
    if (!data.trim()) throw new Error("zoomParser: parameter required after `z`");
    const extracted = parseImgFuncArgs(data, "zoom");

    return ZoomSchema.parse(extracted);
};

function aspectRatioParser(data: string) {
    if (!data.trim()) throw new Error("zoomParser: parameter required after `ar`");
    const extracted = parseImgFuncArgs(data, "aspectRatio");

    return AspectRatioSchema.parse(extracted);
};

function paddingParser(data: string) {
    if (!data.trim()) throw new Error("parameter required after `pad`");
    const extracted = parseImgFuncArgs(data, "padding");

    return PaddingSchema.parse(extracted);
};

function rotateParser(data: string) {
    if (!data.trim()) throw new Error("parameter required after `rt`");
    const extracted = parseImgFuncArgs(data, "rotate");

    return RotateSchema.parse(extracted);
}


