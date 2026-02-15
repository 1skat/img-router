import type { ExtractType } from "@/img_processor/types";
import type { TransformationResolver } from "../resolver";
import { get, is } from "../helpers";
import type { ResizeOptions } from "sharp";
import type sharp from "sharp";
import { unescape } from "querystring";
import type { ImgStateFields } from "../types";
import type { ImageState } from "../state";

export const resolveExtract = (ctx: TransformationResolver, img: ImageState, data: ExtractType): void => {
    const { w, h, x, y } = data; // e.g 100,250
    if (w === undefined && h === undefined) throw new Error("extract: at least one dimension required");

    const ar = img.getAspectRatio; // e.g 200/600
    const extrW = w ?? Math.round(h * ar);
    const extrH = h ?? Math.round(w / ar);

    if (img.isPostExtracted) {
        const postExtrW = img.getCurrWidthV2; // 220
        const postExtrH = img.getCurrHeightV2; // 600

        if (extrW > postExtrW) throw new Error(`extract: width ${w} exceeds max width ${postExtrW}`);
        if (extrH > postExtrH) throw new Error(`extract: height ${h} exceeds max height ${postExtrH}`);

        const left = x ?? Math.round((postExtrW - extrW) / 2); // (200-100)/2 = 50
        const top = y ?? Math.round((postExtrH - extrH) / 2); //(600-300)/2 = 150

        if (left > (postExtrW - extrW)) throw new Error("x out of boundary");
        if (top > (postExtrH - extrH)) throw new Error("y out of boundary");

        const newLeft = (get.ifSet(img.state.postLeftOffset) ?? 0) + left;
        const newTop = (get.ifSet(img.state.postTopOffset) ?? 0) + top;

        img.updateState("extract", { left: newLeft, top: newTop, width: extrW, height: extrH });
    }
    else {
        const imgWidth = img.getCurrWidthV2;
        const imgHeight = img.getCurrHeightV2;
        console.log("extract:", imgWidth, imgHeight);

        const left = x ?? Math.round((imgWidth - extrW) / 2);
        const top = y ?? Math.round((imgHeight - extrH) / 2);

        if (left > (imgWidth - extrW)) throw new Error("x out of boundary");
        if (top > (imgHeight - extrH)) throw new Error("y out of boundary");

        img.updateState("extract", { left: left, top: top, width: extrW, height: extrH });
    };
};
