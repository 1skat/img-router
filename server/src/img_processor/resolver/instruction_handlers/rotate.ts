import type { RotateType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import type { RotateContent } from "../state_handlers/types";
import type { ImageState } from "../state";

export function resolveRotate(ctx: TransformationResolver, img: ImageState, data: RotateType) {
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
    if (img.state.isZoomed && degrees % 90 === 0) {
        const { w: rotatedPostWidth, h: rotatedPostHeight } = rotateArea(img.state.postWidth, img.state.postHeight);
        const leftOffset = degrees % 180 !== 0 ? img.state.postTopOffset : img.state.postLeftOffset;
        const topOffset = degrees % 180 !== 0 ? img.state.postLeftOffset : img.state.postTopOffset;
        img.state.postLeftOffset = leftOffset;
        img.state.postTopOffset = topOffset;
        img.state.postWidth = rotatedPostWidth;
        img.state.postHeight = rotatedPostHeight;
    };

    img.updateState("rotate", { degrees: degrees, background: bg });
};
