import { TransformationResolver } from "@/img_processor/resolver/resolver";
import type { AspectRatioType, ResizeType } from "../../types";
import type { ResizeOptions } from "sharp";
import type sharp from "sharp";
import { unescape } from "querystring";

function handleBothSides(ctx: TransformationResolver, dimensions: { width: number, height: number }, opts: ResizeType) {
    const out: ResizeOptions = {};
    const { width, height } = dimensions;
    const { fit, bg, x, y } = opts;

    out.width = width;
    out.height = height;
    out.fit = fit?.mode
    out.position = fit?.position;
    out.background = bg;

    if (x === undefined && y === undefined) {
        ctx.updateState("resize", out);
        return;
    };

    const { origWidth: origW, origHeight: origH } = ctx.img.state;
    const scale = Math.max(width / origW, height / origH);

    const resizedW = Math.round(origW * scale);
    const resizedH = Math.round(origH * scale);

    if (x && (width + x) > resizedW) throw new Error(`x out of boundary. Max x: ${resizedW - width}, received: ${x}`);
    if (y && (height + y) > resizedH) throw new Error(`y out of boundary. Max y: ${resizedH - height}, received: ${y}`);

    ctx.updateState("resize", { width: resizedW, height: resizedH });
    ctx.updateState("extract", {
        left: x,
        top: y,
        width: width,
        height: height,
    });
    return;
};

function handleSingleSide(ctx: TransformationResolver, dimensions: { width?: number, height?: number }, opts: ResizeType) {
    const out: sharp.ResizeOptions = {};

    const { width, height } = dimensions;
    const { fit, x, y, bg } = opts;
    const { aspectRatio } = ctx.getReqFunctions(["aspectRatio"]);

    out.background = bg; out.fit = fit?.mode
    out.position = fit?.position;

    if (x || y) throw new Error("no space available for padding");

    const ar = ctx.img.getAspectRatio;
    out.width = height ? Math.round(height * ar) : width;
    out.height = width ? Math.round(width / ar) : height;

    ctx.updateState("resize", out);
    return;
};


export const resolveResize = (ctx: TransformationResolver, data: ResizeType): void => {
    const { w: width, h: height, x, y } = data;
    if (!width && !height) throw new Error("resize: at least one dimension required");

    if (width && height) return handleBothSides(ctx, { width, height }, data);
    if (width || height) return handleSingleSide(ctx, { width, height }, data);
};
