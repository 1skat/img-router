import type { ZoomParams, ZoomType } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export function resolveZoom(ctx: TransformationResolver, data: ZoomType) {
    const { z: zoom, vp, hp } = data;
    if (!zoom) throw new Error("zoom value undefined");

    const { width: stateW, height: stateH, top: stateTop, left: stateLeft } = ctx.state;
    const { origWidth: origW, origHeight: origH, aspectRatio: ar } = ctx.state;

    const scaledX = stateW / origW;
    const scaledY = stateH / origH;

    const scaledWidth = Math.round(stateW * zoom);
    const scaledHeight = Math.round((stateW / ar) * zoom);

    if (scaledX > scaledY) { // constrained by height
        const rawLeft = Math.round((scaledWidth - stateW) / 2);
        const scaledStateTop = stateTop !== undefined ? stateTop * zoom : undefined;
        const rawTop = scaledStateTop !== undefined ? Math.round(scaledY + (((stateH * zoom) - stateH) / 2)) : Math.round((scaledHeight - stateH) / 2);

        const tbMaxPadding = Math.round(((stateH * zoom) - stateH) / 2); // extra pxs from scaling the state height
        const lrMaxPadding = Math.round(((stateW * zoom) - stateW) / 2);

        if (vp !== undefined && Math.abs(vp) > tbMaxPadding) throw new Error(`vertical padding out of boundary. max: ${vp < 0 ? -tbMaxPadding : tbMaxPadding} received: ${vp}`);
        if (hp !== undefined && Math.abs(hp) > lrMaxPadding) throw new Error(`horizontal padding out of boundary. max: ${hp < 0 ? -lrMaxPadding : tbMaxPadding} received: ${hp}`);

        const top = rawTop - (vp ?? 0);
        const left = rawLeft - (hp ?? 0);
        ctx.addInstruction("resize", { width: scaledWidth, fit: "outside" });
        ctx.addInstruction("extract", {
            left: left, top: top, width: stateW, height: stateH,
        });
    }
    else if (scaledY > scaledX) {
        const scaledWidth = Math.round((stateH * ar) * zoom);
        const scaledHeight = Math.round(stateH * zoom);

        const top = Math.round((scaledHeight - stateH) / 2);
        const scaledX = stateLeft !== undefined ? stateLeft * zoom : undefined;
        const rawLeft = scaledX !== undefined ? Math.round(scaledX + (((stateW * zoom) - stateW) / 2)) : Math.round((scaledWidth - stateW) / 2);
        ctx.addInstruction("resize", { height: scaledHeight, fit: "outside" });
        ctx.addInstruction("extract", {
            left: rawLeft, top: top, width: stateW, height: stateH,
        });
    }
    else {
        const scaledWidth = Math.round(stateW * zoom);
        const scaledHeight = Math.round(stateH * zoom);
        const left = Math.round((scaledWidth - stateW) / 2);
        const top = Math.round((scaledHeight - stateH) / 2);
        ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
        ctx.addInstruction("extract", {
            left: left, top: top, width: stateW, height: stateH,
        });
    };

    // if (scaledY > scaledX) { // constrained by width
    //     const scaledWidth = Math.round(stateW * )
    // }

    // const scaledWidth = Math.round(stateW * zoom); // 1200
    // const scaledHeight = Math.round((* zoom); // 893

    // const left = Math.round((scaledWidth - stateW) / 2);
    // const maxTop = scaledHeight - stateH; // 103
    // const scaledTop = zoom * stateTop; // 593
    // const top = Math.round(scaledTop + ((maxTop - scaledTop) / 2)); // 593 + (806-593)

    // // console.log("stateW:", stateW, "stateH:", stateH, "left:", left, "top:", top, "stateTop:", stateTop, "stateLeft", stateLeft, "scaledWidth", scaledWidth, "scaledHeight:", scaledHeight);
    // ctx.addInstruction("resize", { width: scaledWidth, fit: "outside" }); // fit to match original AR
    // ctx.addInstruction("extract", {
    //     left: left, top: top, width: stateW, height: stateH,
    // });
};

