import type sharp from "sharp";
import type { ImgStateFields } from "./types";
import { get, is } from "./helpers";

export class ImageState {
    public state: ImgStateFields;

    constructor(metadata: sharp.Metadata) {
        if (!metadata.width || !metadata.height || !metadata.format) throw new Error("image metdata missing");
        this.state = {
            preLeftOffset: -1,
            preTopOffset: -1,
            preWidth: -1,
            preHeight: -1,
            postLeftOffset: -1,
            postTopOffset: -1,
            postWidth: -1,
            postHeight: -1,
            rsWidth: -1,
            rsHeight: -1,
            rsFit: undefined,
            rsPosition: undefined,
            rsBackground: undefined,
            origWidth: metadata.width,
            origHeight: metadata.height,
        };
    };

    get isRsized() {
        return is.set(this.state.rsWidth) || is.set(this.state.rsHeight);
    };
    get isPreExtracted() {
        return is.set(this.state.preWidth) && is.set(this.state.preHeight);
    };
    get isPostExtracted() {
        return is.set(this.state.postWidth) && is.set(this.state.postHeight);
    };

    get getAspectRatio() {
        return this.getCurrWidth / this.getCurrHeight;
    };
    get getCurrWidth() {
        return (is.set(this.state.preWidth) && is.notSet(this.state.rsWidth))
            ? this.state.preWidth
            : get.ifSet(this.state.postWidth)
            ?? get.ifSet(this.state.rsWidth)
            ?? get.ifSet(this.state.origWidth);
    };

    get getCurrHeight() {
        return (is.set(this.state.preHeight) && is.notSet(this.state.rsHeight))
            ? this.state.preHeight
            : get.ifSet(this.state.postHeight)
            ?? get.ifSet(this.state.rsHeight)
            ?? get.ifSet(this.state.origHeight);
    };
};
