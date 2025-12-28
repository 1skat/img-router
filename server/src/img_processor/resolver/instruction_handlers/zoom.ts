import type { ZoomType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";

export function resolveZoom(ctx: TransformationResolver, data: ZoomType) {
    if (ctx.img.state.postWidth && ctx.img.state.postHeight) { // POST
        handlePostResized(ctx, data);
        return;
    }
    else if (ctx.img.state.rsWidth || ctx.img.state.rsHeight) { // RS
        handleResized(ctx, data);
        return;
    }
    else if ((ctx.img.state.rsWidth === null && ctx.img.state.rsHeight === null) && (ctx.img.state.preWidth && ctx.img.state.preHeight)) { // PRE
        handlePreResized(ctx, data);
        return;
    } else {
        handleOriginal(ctx, data);
    }
};

function handlePreResized(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { origWidth: origW, origHeight: origH, preWidth: pW, preHeight: pH } = ctx.img.state;

    const scaledWidth = Math.round(pW * zoom);
    const scaledHeight = Math.round(pH * zoom);
    const left = Math.round((scaledWidth - pW) / 2);
    const top = Math.round((scaledHeight - pH) / 2);
    ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstruction("extract", {
        left: left, top: top, width: pW, height: pH,
    });
};

function handlePostResized(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { rsWidth: rsW, rsHeight: rsH, postTopOffset: pTop, postLeftOffset: pLeft, postWidth: postW, postHeight: postH } = ctx.img.state;

    const scaledWidth = Math.round(rsW * zoom);
    const scaledHeight = Math.round(rsH * zoom);
    const rawLeft = pLeft !== null ? Math.round((pLeft * zoom) + (((postW * zoom) - postW) / 2)) : Math.round((scaledWidth - postW) / 2);
    const rawTop = pTop !== null ? Math.round((pTop * zoom) + (((postH * zoom) - postH) / 2)) : Math.round((scaledHeight - postH) / 2);

    ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstruction("extract", {
        left: rawLeft, top: rawTop, width: postW, height: postH,
    });
    return;
};

function handleResized(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { rsWidth: rsW, rsHeight: rsH } = ctx.img.state;
    const scaledWidth = Math.round(rsW * zoom);
    const scaledHeight = Math.round(rsH * zoom);
    const left = Math.round((scaledWidth - rsW) / 2);
    const top = Math.round((scaledHeight - rsH) / 2);

    ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstruction("extract", {
        left: left, top: top, width: rsW, height: rsH,
    });
    return;
};

function handleOriginal(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { origWidth: origW, origHeight: origH } = ctx.img.state;

    const scaledWidth = Math.round(origW * zoom);
    const scaledHeight = Math.round(origH * zoom);
    const left = Math.round((scaledWidth - origW) / 2);
    const top = Math.round((scaledHeight - origH) / 2);
    ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstruction("extract", {
        left: left, top: top, width: origW, height: origH,
    });
    return;
};
