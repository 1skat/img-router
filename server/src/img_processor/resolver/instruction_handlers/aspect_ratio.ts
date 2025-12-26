import type { AspectRatioType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";

export const resolveAspectRatio = (ctx: TransformationResolver, data: AspectRatioType): void => {
    if ("resize" in ctx.reqFunctions) return; // resize will handle it

    const { w, h, fit } = data;

    // const { width, height } = ctx.state;
    // const { wRatio, hRatio } = value;

    // if (!wRatio || !hRatio) throw new Error("aspect ratio undefined");

    // const currRatio = width / height;
    // const targetRatio = wRatio / hRatio;

    // const outWidth = (currRatio > targetRatio) ? Math.round(height * targetRatio) : width;
    // const outHeight = (currRatio < targetRatio) ? Math.round(width / targetRatio) : height;

    // ctx.addInstruction("resize", { width: outWidth, height: outHeight });
    // ctx.state.applyResize({ width: outWidth, height: outHeight });
    // return;
};
