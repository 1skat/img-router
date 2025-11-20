import { TransformationResolver } from "@/img_processor/resolver/main";
import type { ResizeParams } from "../../types";

export const resolveResize = (ctx: TransformationResolver, value: ResizeParams): void => {
    const { width, height } = value;
    if (!width && !height) throw new Error("resize requires at least one dimension");
    const { position, extract, aspectRatio } = ctx.getMods(["position", "extract", "aspectRatio"]);

    if (width && height) {
        if (extract && position) {
            const leftOffset = position.x ?? Math.round((ctx.state.width - width) / 2);
            const topOffset = position.y ?? Math.round((ctx.state.height - height) / 2);

            if (leftOffset > (ctx.state.width - width)) throw new Error("x out of boundary");
            if (topOffset > (ctx.state.height - height)) throw new Error("y out of boundary");

            ctx.addInstruction("extract", { left: leftOffset, top: topOffset, width: width, height: height });
            return;
        };

        if (position) {
            const { x, y } = position;
            const origRatio = ctx.state.width / ctx.state.height;
            const currRatio = width / height;

            const boxWidth = (origRatio > currRatio) ? Math.round(height * origRatio) : width;
            const boxHeight = (origRatio < currRatio) ? Math.round(width / origRatio) : height;

            const xMax = boxWidth - width;
            const yMax = boxHeight - height;

            if ((xMax - x) < 0) throw new Error("x out of boundary");
            if ((yMax - y) < 0) throw new Error("y out of boundary");

            ctx.addInstruction("resize", { width: boxWidth, height: boxHeight });
            ctx.addInstruction("extract", { left: x ?? 0, top: y ?? 0, width: width, height: height });
            return;
        };

        ctx.addInstruction("resize", { width, height });
        return;
    };

    if (width || height) {
        if (aspectRatio) {
            const { wRatio, hRatio } = aspectRatio;
            const outWidth = width ?? Math.round((height * wRatio) / hRatio);
            const outHeight = height ?? Math.round((width * hRatio) / wRatio);
            ctx.addInstruction("resize", { width: outWidth, height: outHeight });
            return;
        };

        const orgAspectRatio = ctx.state.width / ctx.state.height;
        const outWidth = height ? Math.round(height * orgAspectRatio) : width;
        const outHeight = width ? Math.round(width / orgAspectRatio) : height;
        ctx.addInstruction("resize", { width: outWidth, height: outHeight });
        return;
    };
};
