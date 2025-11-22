import type { ZoomParams } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export function resolveZoom(ctx: TransformationResolver, value: ZoomParams) {
    const { zoom } = value;
    if (!zoom) throw new Error("zoom value undefined");

    const { width: origW, height: origH } = ctx.state;

    const scaledWidth = Math.round(origW * zoom);
    const scaledHeight = Math.round(origH * zoom);

    const left = Math.round((scaledWidth - origW) / 2);
    const top = Math.round((scaledHeight - origH) / 2);

    ctx.addInstructionV2("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstructionV2("extract", { left: left, top: top, width: origW, height: origH });
};
