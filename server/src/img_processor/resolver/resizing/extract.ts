import type { ExtractType } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export const resolveExtract = (ctx: TransformationResolver, data: ExtractType): void => {
    const { w, h, x, y } = data;
    if (w === undefined && h === undefined) throw new Error("extract: at least one dimension requireed");

    const width = w ?? Math.round(h * ctx.state.aspectRatio);
    const height = h ?? Math.round(w / ctx.state.aspectRatio);

    const imgWidth = ctx.state.currWidth ?? ctx.state.origWidth;
    const imgHeight = ctx.state.currHeight ?? ctx.state.origHeight;

    const left = x ?? Math.round((imgWidth - width) / 2);
    const top = y ?? Math.round((imgHeight - height) / 2);

    if (left > (imgWidth - width)) throw new Error("x out of boundary");
    if (top > (imgHeight - height)) throw new Error("y out of boundary");

    ctx.addInstruction("extract", { left: left, top: top, width: width, height: height });
    // ctx.state.applyExtract({ width, height, x: left, y: top });
    return;
};
