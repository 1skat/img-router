import { TransformationResolver } from "@/img_processor/resolver/main";
import type { ResizeType } from "../../types";
import type { ResizeOptions } from "sharp";
import type sharp from "sharp";
import { unescape } from "querystring";

// export const resolveResize1 = (ctx: TransformationResolver, value: ResizeParams): void => {
//     const { width, height } = value;
//     if (!width && !height) throw new Error("resize requires at least one dimension");

//     if (width && height) return handleBothSides(ctx, { width, height });
//     if (width || height) return handleSingleSide(ctx, { width, height });
// };

function handleBothSides(ctx: TransformationResolver, dimensions: { width: number, height: number }, opts: ResizeType) {
    const out: ResizeOptions = {};
    const { width, height } = dimensions;
    const { fit, bg, x, y } = opts;

    out.width = width;
    out.height = height;
    out.fit = fit?.mode
    out.position = fit?.position;
    out.background = bg;

    if (x !== undefined || y !== undefined) {
        const { origWidth: origW, origHeight: origH } = ctx.state;

        const scaledX = width / origW;
        const scaledY = height / origH;

        if (scaledX > scaledY) {
            const intermediateHeight = Math.ceil(origH * scaledX)
            const maxTop = intermediateHeight - height;
            if (y > maxTop) throw new Error(`y out of boundary. Max y: ${maxTop}, y received: ${y}`);
            ctx.addInstruction("resize", { width: width });
            ctx.state.applyResize({ width });
            ctx.addInstruction("extract", {
                left: 0,
                top: y,
                width: width,
                height: height,
            });
            ctx.state.applyExtract({ width, height, x: 0, y: y });
            return;
        }
        else if (scaledY > scaledX) { // constrained by width
            const intermediateWidth = Math.floor(origW * scaledY)
            const maxLeft = intermediateWidth - width;
            if (x > maxLeft) throw new Error(`x out of boundary. Max x: ${maxLeft}, x received: ${x}`);
            ctx.addInstruction("resize", { height: height });
            ctx.addInstruction("extract", {
                left: x,
                top: 0,
                width: width,
                height: height
            });
            ctx.state.applyResize({ width, height });
            ctx.state.applyOffest({ left: x, top: undefined });
            return;
        }
        else throw new Error("no space available for padding");
    };

    // // INVERSE LOGIC
    // if (x !== undefined || y !== undefined) {
    //     const { width: origW, height: origH } = ctx.state;

    //     const scaleX = origW / width;
    //     const scaleY = origH / height;

    //     const scale = Math.min(scaleX, scaleY); // dimension inverse scale factor

    //     if (scale === scaleX) {
    //         if (x) throw new Error("x out of boundary"); // constrained by width, no x movment possible
    //         const scaledHeight = height * scale; // 100 * 3 = 300
    //         const scaledPadding = y * scale; // 198 * 3 = 594
    //         const yAxisMaxPadding = origH - scaledHeight; // 893 - 300 = 593px available on y axis
    //         console.log("scaled:", scaledPadding, "max:", yAxisMaxPadding) // scaled: 594 max: 593
    //         if (scaledPadding > yAxisMaxPadding) throw new Error("y out of boundary");
    //     };
    //     if (scale === scaleY) {
    //         if (y) throw new Error("y out of boundary"); // constrained by height, no y movement possible
    //         const scaledWidth = width * scale;
    //         const scaledPadding = Math.round(x * scale);
    //         const xAxisMaxPadding = Math.round(origW - scaledWidth);
    //         if (scaledPadding > xAxisMaxPadding) throw new Error("x out of boundary");
    //     };

    //     const left = (scale === scaleX) ? 0 : Math.round(scale * x);
    //     const top = (scale === scaleY) ? 0 : Math.round(scale * y);
    //     console.log("handleBothSides: left top", left, top);
    //     const scaledWidth = (scale === scaleY) ? Math.round(scale * width) : origW;
    //     const scaledHeight = (scale === scaleX) ? Math.round(scale * height) : origH;

    //     ctx.addInstruction("extract", { left: left, top: top, width: scaledWidth, height: scaledHeight });
    //     ctx.addInstruction("resize", out);
    //     ctx.state.applyResize({ width, height });
    //     return;
    // };

    ctx.addInstruction("resize", out);
    ctx.state.applyResize({ width, height });
    return;
};

function handleSingleSide(ctx: TransformationResolver, dimensions: { width?: number, height?: number }, opts: ResizeType) {
    const out: sharp.ResizeOptions = {};

    const { width, height } = dimensions;
    const { fit, x, y, bg } = opts;
    const { aspectRatio } = ctx.getReqFunctions(["aspectRatio"]);

    out.background = bg;
    out.fit = fit?.mode
    out.position = fit?.position;

    // if (aspectRatio) {
    //     const { wRatio, hRatio } = aspectRatio;
    //     out.width = width ?? Math.round((height! * wRatio) / hRatio);
    //     out.height = height ?? Math.round((width! * hRatio) / wRatio);
    //     ctx.addInstruction("resize", out);
    //     ctx.state.applyResize({ width: out.width, height: out.height });
    //     return;
    // };

    if (x || y) throw new Error("no space available for padding");

    const ar = ctx.state.aspectRatio;
    out.width = height ? Math.round(height * ar) : width;
    out.height = width ? Math.round(width / ar) : height;
    console.log(out);
    ctx.addInstruction("resize", out);
    ctx.state.applyResize({ width: out.width, height: out.height });
    return;
};


export const resolveResize = (ctx: TransformationResolver, data: ResizeType): void => {
    const { w: width, h: height, x, y } = data;
    if (!width && !height) throw new Error("resize: at least one dimension required");

    if (width && height) return handleBothSides(ctx, { width, height }, data);
    if (width || height) return handleSingleSide(ctx, { width, height }, data);
};
