import type { ZoomType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { ImageState } from "../state";

export function resolveZoom(ctx: TransformationResolver, img: ImageState, data: ZoomType) {
    if (img.isPostExtracted) { // POST
        handlePostResized(img, data);
        return;
    }
    else if (img.isRsized) { // RS 
        handleResized(img, data);
        return;
    }
    else if (img.isPreExtracted && !img.isRsized) { // PRE
        handlePreResized(img, data);
        return;
    } else {
        handleOriginal(img, data);
    }
};

function handlePreResized(img: ImageState, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { origWidth: origW, origHeight: origH, preWidth: pW, preHeight: pH } = img.state;

    const scaledWidth = Math.round(pW * zoom);
    const scaledHeight = Math.round(pH * zoom);
    const left = Math.round((scaledWidth - pW) / 2);
    const top = Math.round((scaledHeight - pH) / 2);

    const hpPx = hp ?? 0;
    const vpPx = vp ?? 0;

    if (Math.abs(hpPx) > left) throw new Error("zoom: horizontal padding out of boundary");
    if (Math.abs(vpPx) > top) throw new Error("zoom: vertical padding out of boundary");

    img.updateState("resize", { width: scaledWidth, height: scaledHeight, fit: "fill" });
    img.updateState("extract", {
        left: left + hpPx, top: top + vpPx, width: pW, height: pH,
    });
    img.state.isZoomed = true;
};

function handlePostResized(img: ImageState, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { rsWidth: rsW, rsHeight: rsH, postTopOffset: pTop, postLeftOffset: pLeft, postWidth: postW, postHeight: postH } = img.state;

    const scaledWidth = Math.round(rsW * zoom);
    const scaledHeight = Math.round(rsH * zoom);
    const rawLeft = pLeft !== -1 ? Math.round((pLeft * zoom) + (((postW * zoom) - postW) / 2)) : Math.round((scaledWidth - postW) / 2);
    const rawTop = pTop !== -1 ? Math.round((pTop * zoom) + (((postH * zoom) - postH) / 2)) : Math.round((scaledHeight - postH) / 2);
    const hpPx = hp ?? 0;
    const vpPx = vp ?? 0;

    // const maxHorionalOffset = pLeft !== -1 ? scaledWidth - (rawLeft + postW) : rawLeft;
    // const maxVerticalOffset = pTop !== -1 ? scaledHeight - (rawTop + postH) : rawTop;
    const absMaxHPWithinBox = Math.round(((postW * zoom) - postW) / 2);
    const absMaxVPWithinBox = Math.round(((postH * zoom) - postH) / 2);

    if (Math.abs(hpPx) > absMaxHPWithinBox) throw new Error("zoom: horizontal padding out of boundary");
    if (Math.abs(vpPx) > absMaxVPWithinBox) throw new Error("zoom: vertical padding out of boundary");

    img.updateState("resize", { width: scaledWidth, height: scaledHeight });
    img.updateState("extract", {
        left: rawLeft + hpPx, top: rawTop + vpPx, width: postW, height: postH,
    });
    img.state.isZoomed = true;
};

function handleResized(img: ImageState, data: ZoomType) {
    console.log("RESIZED");
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const getPositions = (left: number, top: number) => {
        const hpPx = hp ?? 0;
        const vpPx = vp ?? 0;
        if (Math.abs(hpPx) > left) throw new Error("zoom: horizontal padding out of boundary");
        const paddedLeft = left + hpPx;
        return { l: paddedLeft, t: top };
    };

    const { rsWidth: rsW, rsHeight: rsH } = img.state;
    const scaledWidth = Math.round(rsW * zoom);
    const scaledHeight = Math.round(rsH * zoom);

    const left = Math.round((scaledWidth - rsW) / 2);
    const top = Math.round((scaledHeight - rsH) / 2);
    const hpPx = hp ?? 0;
    const vpPx = vp ?? 0;
    if (Math.abs(hpPx) > left) throw new Error("zoom: horizontal padding out of boundary");
    if (Math.abs(vpPx) > top) throw new Error("zoom: vertical padding out of boundary");

    img.updateState("resize", { width: scaledWidth, height: scaledHeight });
    img.updateState("extract", {
        left: left + hpPx, top: top + vpPx, width: rsW, height: rsH,
    });
    img.state.isZoomed = true;
};

function handleOriginal(img: ImageState, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { origWidth: origW, origHeight: origH } = img.state;

    const scaledWidth = Math.round(origW * zoom);
    const scaledHeight = Math.round(origH * zoom);
    const left = Math.round((scaledWidth - origW) / 2);
    const top = Math.round((scaledHeight - origH) / 2);

    const hpPx = hp ?? 0;
    const vpPx = vp ?? 0;

    if (Math.abs(hpPx) > left) throw new Error("zoom: horizontal padding out of boundary");
    if (Math.abs(vpPx) > top) throw new Error("zoom: vertical padding out of boundary");

    img.updateState("resize", { width: scaledWidth, height: scaledHeight });
    img.updateState("extract", {
        left: left + hpPx, top: top + vpPx, width: origW, height: origH,
    });
    img.state.isZoomed = true;
};
