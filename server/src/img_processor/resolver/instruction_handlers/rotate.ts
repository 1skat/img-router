import type { RotateType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { RotateContent } from "../state_handlers/types";
import type { ImageState } from "../state";

export function resolveRotate(ctx: ImageState, data: RotateType) {
    const { degrees, bg } = data;
    const rotateArea = (w: number, h: number) => {
        const rad = (degrees * Math.PI) / 180;
        return {
            w: Math.round(
                Math.abs(w * Math.cos(rad)) +
                Math.abs(h * Math.sin(rad))
            ),
            h: Math.round(
                Math.abs(w * Math.sin(rad)) +
                Math.abs(h * Math.cos(rad))
            )
        };
    };
    if (ctx.state.isZoomed && degrees % 90 === 0) {
        const { w: rotatedPostWidth, h: rotatedPostHeight } = rotateArea(ctx.state.postWidth, ctx.state.postHeight);
        const leftOffset = degrees % 180 !== 0 ? ctx.state.postTopOffset : ctx.state.postLeftOffset;
        const topOffset = degrees % 180 !== 0 ? ctx.state.postLeftOffset : ctx.state.postTopOffset;
        ctx.state.postLeftOffset = leftOffset;
        ctx.state.postTopOffset = topOffset;
        ctx.state.postWidth = rotatedPostWidth;
        ctx.state.postHeight = rotatedPostHeight;
    };

    ctx.updateState("rotate", { degrees: degrees, background: bg });
};
