import type { ZoomParams } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export function resolveZoom(ctx: TransformationResolver, value: ZoomParams) {
    const { zoom } = value;
    if (!zoom) throw new Error("zoom value undefined");

    const origWidth = ctx.state.width;
    const origHeight = ctx.state.height;

    const scaledWidth = Math.round(origWidth * zoom);
    const scaledHeight = Math.round(origHeight * zoom);

    const left = Math.round((scaledWidth - origWidth) / 2);
    const top = Math.round((scaledHeight - origHeight) / 2);

    ctx.addInstructionV2("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstructionV2("extract", { left: left, top: top, width: origWidth, height: origHeight });
};
