import { TransformationResolver } from "@/img_processor/resolver/resolver";
import type { AspectRatioType, ResizeType } from "../../types";
import type { ResizeOptions } from "sharp";
import type { ImageState } from "../state";
import type { ResizeContent } from "../state_handlers/types";

function handleBothSides(ctx: ImageState, dimensions: { width: number, height: number }, opts: ResizeType) {
    const out: ResizeContent = {};
    const { width, height } = dimensions;
    const { fit, bg, x, y } = opts;

    out.width = width;
    out.height = height;
    out.fit = fit?.mode
    out.position = fit?.position;
    out.background = bg;

    if (x === undefined && y === undefined) {
        console.log(width, height)
        ctx.updateState("resize", out);
        return;
    };

    const { getCurrWidthV2: currW, getCurrHeightV2: currH } = ctx;
    const scale = Math.max(width / currW, height / currH); // 1000/800 and 500/350 given the ratio is 2.28

    // Full image size
    const resizedW = Math.round(currW * scale);
    const resizedH = Math.round(currH * scale);

    const maxTop = resizedH - height;
    const maxLeft = resizedW - width;
    if (x > maxLeft || (x === 0 && maxLeft === 0)) throw new Error(`x out of boundary. Max offset: ${resizedW - width}px`);
    if (y > maxTop || (y === 0 && maxTop === 0)) throw new Error(`y out of boundary. Max offset: ${resizedH - height}px`);

    const left = x ?? Math.round((resizedW - width) / 2);
    const top = y ?? Math.round((resizedH - height) / 2);

    ctx.updateState("resize", { width: resizedW, height: resizedH }); // resize to full image
    ctx.updateState("extract", { // resize to viewport
        left: left,
        top: top,
        width: width,
        height: height,
    });
    return;
};

function handleSingleSide(ctx: ImageState, dimensions: { width?: number, height?: number }, opts: ResizeType) {
    const out: ResizeContent = {};

    const { width, height } = dimensions;
    const { fit, x, y, bg } = opts;

    out.background = bg;
    out.fit = fit?.mode;
    out.position = fit?.position;

    if (x || y) throw new Error("no space available for padding");

    const ar = ctx.getAspectRatio;
    out.width = height ? Math.round(height * ar) : width;
    out.height = width ? Math.round(width / ar) : height;

    ctx.updateState("resize", out);
    return;
};

export const resolveResize = (ctx: ImageState, data: ResizeType): void => {
    const { w: width, h: height, x, y } = data;
    if (!width && !height) throw new Error("resize: at least one dimension required");

    if (width && height) return handleBothSides(ctx, { width, height }, data);
    if (width || height) return handleSingleSide(ctx, { width, height }, data);
};
