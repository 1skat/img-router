import type { ZoomParams } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export function resolveZoom(ctx: TransformationResolver, value: ZoomParams) {
    const { zoom } = value;
    if (!zoom) throw new Error("zoom value undefined");

    const origWidth = ctx.state.width;
    const origHeight = ctx.state.height;
    console.log("state", ctx.state);

    const scaledWidth = Math.round(origWidth * zoom);
    const scaledHeight = Math.round(origHeight * zoom);

    const left = Math.round((scaledWidth - origWidth) / 2);
    const top = Math.round((scaledHeight - origHeight) / 2);

    ctx.addInstruction("resize", { width: scaledWidth, height: scaledHeight });
    ctx.addInstruction("extract", { left: left, top: top, width: origWidth, height: origHeight });
};
