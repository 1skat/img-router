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

// export function resolveZoom2(ctx: TransformationResolver, data: ZoomType) {
//     const { z: zoom, vp, hp } = data;
//     if (!zoom) throw new Error("zoom value undefined");

//     const { width: stateW, height: stateH, top: stateTop, left: stateLeft } = ctx.state;
//     const { origWidth: origW, origHeight: origH, aspectRatio: ar } = ctx.state;

//     const scaledX = Number(stateW / origW).toFixed(3);
//     const scaledY = Number(stateH / origH).toFixed(3);

//     const getTopAndLeft = ({ rawLeft, rawTop }: { rawLeft: number, rawTop: number }) => {
//         const tbMaxPadding = Math.round(((stateH * zoom) - stateH) / 2); // extra pxs from scaling the state height
//         const lrMaxPadding = Math.round(((stateW * zoom) - stateW) / 2);

//         if (vp !== undefined && Math.abs(vp) > tbMaxPadding) throw new Error(`vertical padding out of boundary. max: ${vp < 0 ? -tbMaxPadding : tbMaxPadding} received: ${vp}`);
//         if (hp !== undefined && Math.abs(hp) > lrMaxPadding) throw new Error(`horizontal padding out of boundary. max: ${hp < 0 ? -lrMaxPadding : tbMaxPadding} received: ${hp}`);

//         const top = rawTop - (vp ?? 0);
//         const left = rawLeft - (hp ?? 0);

//         return { top, left };
//     };

//     if (scaledX > scaledY) { // constrained by height
//         const scaledWidth = Math.round(stateW * zoom); // 1000
//         const scaledHeight = Math.round((stateW / ar) * zoom); // 720 
//         const rawLeft = Math.round((scaledWidth - stateW) / 2);
//         const scaledStateTop = stateTop !== undefined ? stateTop * zoom : undefined;
//         const rawTop = scaledStateTop !== undefined ? Math.round(scaledStateTop + (((stateH * zoom) - stateH) / 2)) : Math.round((scaledHeight - stateH) / 2);

//         const { left, top } = getTopAndLeft({ rawLeft, rawTop });
//         // const tbMaxPadding = Math.round(((stateH * zoom) - stateH) / 2); // extra pxs from scaling the state height
//         // const lrMaxPadding = Math.round(((stateW * zoom) - stateW) / 2);

//         // if (vp !== undefined && Math.abs(vp) > tbMaxPadding) throw new Error(`vertical padding out of boundary. max: ${vp < 0 ? -tbMaxPadding : tbMaxPadding} received: ${vp}`);
//         // if (hp !== undefined && Math.abs(hp) > lrMaxPadding) throw new Error(`horizontal padding out of boundary. max: ${hp < 0 ? -lrMaxPadding : tbMaxPadding} received: ${hp}`);

//         // const top = rawTop - (vp ?? 0);
//         // const left = rawLeft - (hp ?? 0);
//         ctx.addInstruction("resize", { width: scaledWidth, fit: "outside" });
//         ctx.addInstruction("extract", {
//             left: left, top: 0, width: scaledWidth, height: scaledHeight
//         });
//     }
//     else if (scaledY > scaledX) {
//         const scaledWidth = Math.round((stateH * ar) * zoom);
//         const scaledHeight = Math.round(stateH * zoom);
//         const rawTop = stateTop !== undefined ? Math.round((stateTop * zoom) + (((stateH * zoom) - stateH) / 2)) : Math.round((scaledHeight - stateH) / 2);
//         const rawLeft = stateLeft !== undefined ? Math.round((stateLeft * zoom) + (((stateW * zoom) - stateW) / 2)) : Math.round((scaledWidth - stateW) / 2);

//         const { left, top } = getTopAndLeft({ rawLeft, rawTop });
//         console.log("new:", {
//             scaledWidth,
//             scaledHeight,
//             rawLeft,
//             rawTop,
//             result: getTopAndLeft({ rawLeft, rawTop }),
//         });

//         ctx.addInstruction("resize", { height: scaledHeight, fit: "outside" });
//         ctx.addInstruction("extract", {
//             left: left, top: top, width: stateW, height: stateH,
//         });

//         // ----- 
//         // const scaledWidth = Math.round((stateH * ar) * zoom);
//         // const scaledHeight = Math.round(stateH * zoom);

//         // const rawTop = Math.round((scaledHeight - stateH) / 2);
//         // const scaledStateLeft = stateLeft !== undefined ? stateLeft * zoom : undefined;
//         // const rawLeft = scaledStateLeft !== undefined ? Math.round(scaledStateLeft + (((stateW * zoom) - stateW) / 2)) : Math.round((scaledWidth - stateW) / 2);

//         // const { left, top } = getTopAndLeft({ rawLeft, rawTop });
//         // console.log({
//         //     scaledWidth,
//         //     scaledHeight,
//         //     rawLeft,
//         //     rawTop,
//         //     result: getTopAndLeft({ rawLeft, rawTop }),
//         // });
//         // ctx.addInstruction("resize", { height: scaledHeight, fit: "outside" });
//         // ctx.addInstruction("extract", {
//         //     left: left, top: top, width: stateW, height: stateH,
//         // });
//     }
//     else {
//         const scaledWidth = Math.round(stateW * zoom);
//         const scaledHeight = Math.round(stateH * zoom);
//         const left = Math.round((scaledWidth - stateW) / 2);
//         const top = Math.round((scaledHeight - stateH) / 2);
//         ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
//         // ctx.addInstruction("extract", {
//         //     left: left, top: top, width: stateW, height: stateH,
//         // });
//     };
// };

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
