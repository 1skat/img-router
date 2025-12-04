import { TransformationResolver } from "@/img_processor/resolver/main";
import type { ResizeParams } from "../../types";
import type { ResizeOptions } from "sharp";

export const resolveResize = (ctx: TransformationResolver, value: ResizeParams): void => {
    const { width, height } = value;
    if (!width && !height) throw new Error("resize requires at least one dimension");

    if (width && height) return handleBothSides(ctx, { width, height });
    if (width || height) return handleSingleSide(ctx, { width, height });
};

function handleBothSides(ctx: TransformationResolver, dimensions: { width: number, height: number }) {
    const out: ResizeOptions = {};
    const { width, height } = dimensions;
    const { position, extract, fit, background } = ctx.getMods(["position", "extract", "fit", "background"]);

    // Resize payload
    out.background = background;
    out.fit = fit?.fit;
    out.position = fit?.position;
    out.width = width;
    out.height = height;

    if (extract) {
        const leftOffset = position?.x ?? Math.round((ctx.state.width - width) / 2);
        const topOffset = position?.y ?? Math.round((ctx.state.height - height) / 2);

        if (leftOffset > (ctx.state.width - width)) throw new Error("x out of boundary");
        if (topOffset > (ctx.state.height - height)) throw new Error("y out of boundary");

        ctx.addInstructionV2("extract", { left: leftOffset, top: topOffset, width: width, height: height });
        ctx.state.applyResize({ width, height });
        return;
    };

    if (position) {
        const { x, y } = position;
        const { width: origW, height: origH } = ctx.state;

        const scaleX = origW / width;
        const scaleY = origH / height;

        const scale = Math.min(scaleX, scaleY); // dimension inverse scale factor

        if (scale === scaleX) {
            if (x) throw new Error("x out of boundary"); // constrained by width, no x movment possible
            const scaledHeight = height * scale;
            const scaledPadding = Math.round(y * scale);
            const yAxisMaxPadding = Math.round(origH - scaledHeight);
            if (scaledPadding > yAxisMaxPadding) throw new Error("y out of boundary");
        };
        if (scale === scaleY) {
            if (y) throw new Error("y out of boundary"); // constrained by height, no y movement possible
            const scaledWidth = width * scale;
            const scaledPadding = Math.round(x * scale);
            const xAxisMaxPadding = Math.round(origW - scaledWidth);
            if (scaledPadding > xAxisMaxPadding) throw new Error("x out of boundary");
        };

        const left = (scale === scaleX) ? 0 : Math.round(scale * x);
        const top = (scale === scaleY) ? 0 : Math.round(scale * y);
        const scaledWidth = (scale === scaleY) ? Math.round(scale * width) : origW;
        const scaledHeight = (scale === scaleX) ? Math.round(scale * height) : origH;

        ctx.addInstructionV2("extract", { left: left, top: top, width: scaledWidth, height: scaledHeight });
        ctx.addInstructionV2("resize", out);
        ctx.state.applyResize({ width, height });
        return;
    };

    ctx.addInstructionV2("resize", out);
    console.log(out);
    ctx.state.applyResize({ width, height });
    return;
}

function handleSingleSide(ctx: TransformationResolver, dimensions: { width?: number, height?: number }) {
    const out: ResizeOptions = {};
    const { width, height } = dimensions;

    const { aspectRatio, background, fit } = ctx.getMods(["aspectRatio", "background", "fit"]);
    out.background = background;
    out.fit = fit?.fit;
    out.position = fit?.position;


    if (aspectRatio) {
        const { wRatio, hRatio } = aspectRatio;
        out.width = width ?? Math.round((height! * wRatio) / hRatio);
        out.height = height ?? Math.round((width! * hRatio) / wRatio);
        ctx.addInstructionV2("resize", out);
        return;
    };

    const orgAspectRatio = ctx.state.width / ctx.state.height;
    out.width = height ? Math.round(height * orgAspectRatio) : width;
    out.height = width ? Math.round(width / orgAspectRatio) : height;
    ctx.addInstructionV2("resize", out);
    console.log(out);
    ctx.state.applyResize({ width: out.width, height: out.height });
    return;
};
