import type { ZoomType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { ImageState } from "../state";

export function resolveZoom(ctx: ImageState, data: ZoomType) {
    if (ctx.isPostExtracted) { // POST
        handlePostResized(ctx, data);
        return;
    }
    else if (ctx.isRsized) { // RS 
        handleResized(ctx, data);
        return;
    }
    else if (ctx.isPreExtracted && !ctx.isRsized) { // PRE
        handlePreResized(ctx, data);
        return;
    } else {
        handleOriginal(ctx, data);
    }
};

function handlePreResized(ctx: ImageState, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { origWidth: origW, origHeight: origH, preWidth: pW, preHeight: pH } = ctx.state;

    const scaledWidth = Math.round(pW * zoom);
    const scaledHeight = Math.round(pH * zoom);
    const left = Math.round((scaledWidth - pW) / 2);
    const top = Math.round((scaledHeight - pH) / 2);
    ctx.updateState("resize", { width: scaledWidth, height: scaledHeight });
    ctx.updateState("extract", {
        left: left, top: top, width: pW, height: pH,
    });
};

function handlePostResized(ctx: ImageState, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { rsWidth: rsW, rsHeight: rsH, postTopOffset: pTop, postLeftOffset: pLeft, postWidth: postW, postHeight: postH } = ctx.state;

    const scaledWidth = Math.round(rsW * zoom);
    const scaledHeight = Math.round(rsH * zoom);
    const rawLeft = pLeft !== -1 ? Math.round((pLeft * zoom) + (((postW * zoom) - postW) / 2)) : Math.round((scaledWidth - postW) / 2);
    const rawTop = pTop !== -1 ? Math.round((pTop * zoom) + (((postH * zoom) - postH) / 2)) : Math.round((scaledHeight - postH) / 2);
    const hpPx = hp ?? 0;
    const vpPx = vp ?? 0;

    const maxHorionalOffset = pLeft !== -1 ? scaledWidth - (rawLeft + postW) : rawLeft;
    const maxVerticalOffset = pTop !== -1 ? scaledHeight - (rawTop + postH) : rawTop;

    if (Math.abs(hpPx) > rawLeft) throw new Error("zoom: horizontal padding out of boundary");
    if (Math.abs(vpPx) > rawTop) throw new Error("zoom: vertical padding out of boundary");

    ctx.updateState("resize", { width: scaledWidth, height: scaledHeight });
    ctx.updateState("extract", {
        left: rawLeft, top: rawTop, width: postW, height: postH,
    });
    return;
};

function handleResized(ctx: ImageState, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const getPositions = (left: number, top: number) => {
        const hpPx = hp ?? 0;
        const vpPx = vp ?? 0;
        if (Math.abs(hpPx) > left) throw new Error("zoom: horizontal padding out of boundary");
        const paddedLeft = left + hpPx;
        return { l: paddedLeft, t: top };
    };

    const { rsWidth: rsW, rsHeight: rsH } = ctx.state;
    const scaledWidth = Math.round(rsW * zoom);
    const scaledHeight = Math.round(rsH * zoom);

    const left = Math.round((scaledWidth - rsW) / 2);
    const top = Math.round((scaledHeight - rsH) / 2);
    const hpPx = hp ?? 0;
    const vpPx = vp ?? 0;
    if (Math.abs(hpPx) > left) throw new Error("zoom: horizontal padding out of boundary");
    if (Math.abs(vpPx) > top) throw new Error("zoom: vertical padding out of boundary");

    ctx.updateState("resize", { width: scaledWidth, height: scaledHeight });
    ctx.updateState("extract", {
        left: left + hpPx, top: top + vpPx, width: rsW, height: rsH,
    });
    return;
};

function handleOriginal(ctx: ImageState, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { origWidth: origW, origHeight: origH } = ctx.state;

    const scaledWidth = Math.round(origW * zoom);
    const scaledHeight = Math.round(origH * zoom);
    const left = Math.round((scaledWidth - origW) / 2);
    const top = Math.round((scaledHeight - origH) / 2);
    ctx.updateState("resize", { width: scaledWidth, height: scaledHeight });
    ctx.updateState("extract", {
        left: left, top: top, width: origW, height: origH,
    });
    return;
};
