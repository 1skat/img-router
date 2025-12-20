import type { ZoomParams, ZoomType } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export function resolveZoom(ctx: TransformationResolver, data: ZoomType) {
    // extract:
    if (ctx.state.rsWidth === null && ctx.state.rsHeight === null) {
        handlePreResized(ctx, data);
        return;
    };

    if (ctx.state.rsWidth || ctx.state.rsHeight) {
        handlePostResized(ctx, data);
        return;
    };
};

export function resolveZoom2(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { width: stateW, height: stateH, top: stateTop, left: stateLeft } = ctx.state;
    const { origWidth: origW, origHeight: origH, aspectRatio: ar } = ctx.state;

    const scaledX = Number(stateW / origW).toFixed(3);
    const scaledY = Number(stateH / origH).toFixed(3);

    const getTopAndLeft = ({ rawLeft, rawTop }: { rawLeft: number, rawTop: number }) => {
        const tbMaxPadding = Math.round(((stateH * zoom) - stateH) / 2); // extra pxs from scaling the state height
        const lrMaxPadding = Math.round(((stateW * zoom) - stateW) / 2);

        if (vp !== undefined && Math.abs(vp) > tbMaxPadding) throw new Error(`vertical padding out of boundary. max: ${vp < 0 ? -tbMaxPadding : tbMaxPadding} received: ${vp}`);
        if (hp !== undefined && Math.abs(hp) > lrMaxPadding) throw new Error(`horizontal padding out of boundary. max: ${hp < 0 ? -lrMaxPadding : tbMaxPadding} received: ${hp}`);

        const top = rawTop - (vp ?? 0);
        const left = rawLeft - (hp ?? 0);

        return { top, left };
    };

    if (scaledX > scaledY) { // constrained by height
        const scaledWidth = Math.round(stateW * zoom); // 1000
        const scaledHeight = Math.round((stateW / ar) * zoom); // 720 
        const rawLeft = Math.round((scaledWidth - stateW) / 2);
        const scaledStateTop = stateTop !== undefined ? stateTop * zoom : undefined;
        const rawTop = scaledStateTop !== undefined ? Math.round(scaledStateTop + (((stateH * zoom) - stateH) / 2)) : Math.round((scaledHeight - stateH) / 2);

        const { left, top } = getTopAndLeft({ rawLeft, rawTop });
        // const tbMaxPadding = Math.round(((stateH * zoom) - stateH) / 2); // extra pxs from scaling the state height
        // const lrMaxPadding = Math.round(((stateW * zoom) - stateW) / 2);

        // if (vp !== undefined && Math.abs(vp) > tbMaxPadding) throw new Error(`vertical padding out of boundary. max: ${vp < 0 ? -tbMaxPadding : tbMaxPadding} received: ${vp}`);
        // if (hp !== undefined && Math.abs(hp) > lrMaxPadding) throw new Error(`horizontal padding out of boundary. max: ${hp < 0 ? -lrMaxPadding : tbMaxPadding} received: ${hp}`);

        // const top = rawTop - (vp ?? 0);
        // const left = rawLeft - (hp ?? 0);
        ctx.addInstruction("resize", { width: scaledWidth, fit: "outside" });
        ctx.addInstruction("extract", {
            left: left, top: 0, width: scaledWidth, height: scaledHeight
        });
    }
    else if (scaledY > scaledX) {
        const scaledWidth = Math.round((stateH * ar) * zoom);
        const scaledHeight = Math.round(stateH * zoom);
        const rawTop = stateTop !== undefined ? Math.round((stateTop * zoom) + (((stateH * zoom) - stateH) / 2)) : Math.round((scaledHeight - stateH) / 2);
        const rawLeft = stateLeft !== undefined ? Math.round((stateLeft * zoom) + (((stateW * zoom) - stateW) / 2)) : Math.round((scaledWidth - stateW) / 2);

        const { left, top } = getTopAndLeft({ rawLeft, rawTop });
        console.log("new:", {
            scaledWidth,
            scaledHeight,
            rawLeft,
            rawTop,
            result: getTopAndLeft({ rawLeft, rawTop }),
        });

        ctx.addInstruction("resize", { height: scaledHeight, fit: "outside" });
        ctx.addInstruction("extract", {
            left: left, top: top, width: stateW, height: stateH,
        });

        // ----- 
        // const scaledWidth = Math.round((stateH * ar) * zoom);
        // const scaledHeight = Math.round(stateH * zoom);

        // const rawTop = Math.round((scaledHeight - stateH) / 2);
        // const scaledStateLeft = stateLeft !== undefined ? stateLeft * zoom : undefined;
        // const rawLeft = scaledStateLeft !== undefined ? Math.round(scaledStateLeft + (((stateW * zoom) - stateW) / 2)) : Math.round((scaledWidth - stateW) / 2);

        // const { left, top } = getTopAndLeft({ rawLeft, rawTop });
        // console.log({
        //     scaledWidth,
        //     scaledHeight,
        //     rawLeft,
        //     rawTop,
        //     result: getTopAndLeft({ rawLeft, rawTop }),
        // });
        // ctx.addInstruction("resize", { height: scaledHeight, fit: "outside" });
        // ctx.addInstruction("extract", {
        //     left: left, top: top, width: stateW, height: stateH,
        // });
    }
    else {
        const scaledWidth = Math.round(stateW * zoom);
        const scaledHeight = Math.round(stateH * zoom);
        const left = Math.round((scaledWidth - stateW) / 2);
        const top = Math.round((scaledHeight - stateH) / 2);
        ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
        // ctx.addInstruction("extract", {
        //     left: left, top: top, width: stateW, height: stateH,
        // });
    };
};

function handlePreResized(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { origWidth: origW, origHeight: origH, preWidth: pW, preHeight: pH } = ctx.state;

    // Extracted
    if (pW && pH) {
        const scaledWidth = Math.round(pW * zoom);
        const scaledHeight = Math.round(pH * zoom);
        const left = Math.round((scaledWidth - pW) / 2); // TODO: apply preOffsets
        const top = Math.round((scaledHeight - pH) / 2);
        ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
        ctx.addInstruction("extract", {
            left: left, top: top, width: pW, height: pH,
        });
        return;
    };

    // Oiginal zoom
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

function handlePostResized(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { rsWidth: width, rsHeight: height, postTopOffset: top, postLeftOffset: left } = ctx.state;
    const { origWidth: origW, origHeight: origH } = ctx.state;
    const scale = Math.max(width / origW, height / origH);

    console.log(top, left);
    const scaledWidth = Math.round(origW * scale * zoom);
    const scaledHeight = Math.round(origH * scale * zoom);
    const rawLeft = left !== null ? Math.round((left * zoom) + (((width * zoom) - width) / 2)) : Math.round((scaledWidth - width) / 2);
    const rawTop = top !== null ? Math.round((top * zoom) + (((height * zoom) - height) / 2)) : Math.round((scaledHeight - height) / 2);

    ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstruction("extract", {
        left: rawLeft, top: rawTop, width: width, height: height,
    });
    return;
};
