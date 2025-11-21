import { TransformationResolver } from "@/img_processor/resolver/main";
import type { ResizeParams } from "../../types";

export const resolveResize = (ctx: TransformationResolver, value: ResizeParams): void => {
    const { width, height } = value;
    if (!width && !height) throw new Error("resize requires at least one dimension");
    const { position, extract, aspectRatio, zoom } = ctx.getMods(["position", "extract", "aspectRatio", "zoom"]);

    if (width && height) {
        if (extract) { // extr with pos
            const leftOffset = position?.x ?? Math.round((ctx.state.width - width) / 2);
            const topOffset = position?.y ?? Math.round((ctx.state.height - height) / 2);

            if (leftOffset > (ctx.state.width - width)) throw new Error("x out of boundary");
            if (topOffset > (ctx.state.height - height)) throw new Error("y out of boundary");

            ctx.addInstructionV2("extract", { left: leftOffset, top: topOffset, width: width, height: height });
            ctx.state.applyResize({ width, height });
            return;
        };

        if (position) {
            // goal is to get 600x200 box from 1200x893 pixel image. 
            // when i preform (600x200) resize i get an image - width constrained but the height get cut off. I feel like internally its 600x447.
            // const { x, y } = position; // y-30 is the padding i wanna apply to the top. So the image will be 600x200 starting from the 30 pixel on the y axis.
            // const origRatio = ctx.state.width / ctx.state.height;
            // const currRatio = width / height;

            // const boxWidth = (origRatio > currRatio) ? Math.round(height * origRatio) : width; 
            // const boxHeight = (origRatio < currRatio) ? Math.round(width / origRatio) : height;

            // const xMax = boxWidth - width;
            // const yMax = boxHeight - height;

            // if ((xMax - x) < 0) throw new Error("x out of boundary");
            // if ((yMax - y) < 0) throw new Error("y out of boundary");

            // ctx.addInstructionV2("resize", { width: boxWidth, height: boxHeight });
            // ctx.addInstructionV2("extract", { left: x ?? 0, top: y ?? 0, width: width, height: height });

            // ctx.state.applyResize({ width, height });
            // return;
            const { x, y } = position;
            const { width: origW, height: origH } = ctx.state;

            const scaleX = origW / width;
            const scaleY = origH / height;

            const scale = Math.min(scaleX, scaleY);

            if (scale === scaleX && x) throw new Error("x out of boundary"); // 1.37 
            if (scale === scaleY && y) throw new Error("y out of boundary"); // 1.6

            if (scale === scaleX && y > (origH / 2)) // e.g origW=893 y=(2.5*2

                const left = (scale === scaleX) ? 0 : Math.round(scale * x);
            const top = (scale === scaleY) ? 0 : Math.round(scale * y);

            const sacledWidth = (scale === scaleY) ? Math.round(scale * width) : origW;
            const scaledHeight = (scale === scaleX) ? Math.round(scale * height) : origH;

            ctx.addInstructionV2("extract", { left: left, top: top, width: sacledWidth, height: scaledHeight });
            ctx.addInstructionV2("resize", { width, height });
            return;

            // if (targetRatio > origRatio) {
            //     // constained by width
            //     const scaleFactor = ctx.state.width / width;
            //     if (x) throw new Error("x out of boundary");
            //     ctx.addInstructionV2("extract", { left: 0, top: Math.round(scaleFactor * y), width: ctx.state.width, height: Math.round(scaleFactor * height) });
            // }
            // else if (targetRatio < origRatio) {
            //     // constrained by height
            //     const scaleFactor = ctx.state.height / height;
            //     if (y) throw new Error("y out of boundary");
            //     ctx.addInstructionV2("extract", { left: Math.round(scaleFactor * x), top: 0, width: Math.round(scaleFactor * width), height: ctx.state.height });
            // };

            // ctx.addInstructionV2("resize", { width, height });
            // return;
        };

        ctx.addInstructionV2("resize", { width, height });
        ctx.state.applyResize({ width, height });
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
        ctx.addInstructionV2("resize", { width: outWidth, height: outHeight });
        ctx.state.applyResize({ width: outWidth, height: outHeight });
        return;
    };
};
