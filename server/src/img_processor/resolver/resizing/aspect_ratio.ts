import type { AspectRatioParams } from "@/img_processor/types";
import type { TransformationResolver } from "../main";

export const resolveAspectRatio = (ctx: TransformationResolver, value: AspectRatioParams): void => {
    if (ctx.transformsReq.resize) return; // resize will handle it

    const { width, height } = ctx.state;
    const { wRatio, hRatio } = value;

    if (!wRatio || !hRatio) throw new Error("aspect ratio undefined");

    const currRatio = width / height;
    const targetRatio = wRatio / hRatio;

    const outWidth = (currRatio > targetRatio) ? Math.round(height * targetRatio) : width;
    const outHeight = (currRatio < targetRatio) ? Math.round(width / targetRatio) : height;

    ctx.addInstruction("resize", { width: outWidth, height: outHeight });
    ctx.state.applyResize({ width: outWidth, height: outHeight });
};
