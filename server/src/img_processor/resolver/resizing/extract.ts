import type { ExtractType } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export const resolveExtract = (ctx: TransformationResolver, data: ExtractType): void => {
    const { w, h, x, y } = data;
    if (w === undefined && h === undefined) throw new Error("extract: at least one dimension requireed");

    const width = w ?? Math.round(h * ctx.state.aspectRatio);
    const height = h ?? Math.round(w / ctx.state.aspectRatio);

    const left = x ?? Math.round((ctx.state.width - width) / 2);
    const top = y ?? Math.round((ctx.state.height - height) / 2);

    if (left > (ctx.state.width - width)) throw new Error("x out of boundary");
    if (top > (ctx.state.height - height)) throw new Error("y out of boundary");

    ctx.addInstruction("extract", { left: left, top: top, width: width, height: height });
    ctx.state.applyResize({ width, height });
    ctx.state.applyOffest({ left: x, top: y });
    return;
};
