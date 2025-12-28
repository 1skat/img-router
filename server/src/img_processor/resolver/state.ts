import type sharp from "sharp";
import type { ImgStateFields } from "./types";
import { get, is } from "./helpers";

export class ImageState {
    state: ImgStateFields;

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
            origWidth: metadata.width,
            origHeight: metadata.height,
        };
    };

    get isRsized() {
        return this.state.rsWidth !== -1 || this.state.rsHeight !== -1;
    };
    get isPreExtracted() {
        return this.state.preWidth !== -1 && this.state.preHeight !== -1 && this.state.preLeftOffset !== -1 && this.state.preTopOffset !== -1;
    };
    get isPostExtracted() {
        return this.state.postWidth !== -1 && this.state.postHeight !== -1 && this.state.postLeftOffset !== -1 && this.state.postTopOffset !== -1;
    };
    get origWidth() {
        return this.state.origWidth;
    };
    get origHeight() {
        return this.state.origHeight;
    };
    get rsWidth() {
        return this.state.rsWidth;
    };
    get rsHeight() {
        return this.state.rsHeight;
    };
    get preWidth() {
        return this.state.preWidth;
    };
    get preHeight() {
        return this.state.preHeight;
    };
    get postWidth() {
        return this.state.postWidth;
    };
    get postHeight() {
        return this.state.postHeight;
    };
    get preTopOffset() {
        return this.state.preTopOffset;
    };
    get postTopOffset() {
        return this.state.postTopOffset;
    };
    get preLeftOffset() {
        return this.state.preLeftOffset;
    };
    get postLeftOffset() {
        return this.state.postLeftOffset;
    };
    get getAspectRatio() {
        return this.getCurrWidth / this.getCurrHeight;
    };
    get getCurrWidth() {
        return (is.set(this.preWidth) && is.notSet(this.rsWidth)) ? this.preWidth : get.ifSet(this.postWidth) ?? get.ifSet(this.rsWidth) ?? get.ifSet(this.origWidth);
    };
    get getCurrHeight() {
        return (is.set(this.preHeight) && is.notSet(this.rsHeight)) ? this.preHeight : get.ifSet(this.postHeight) ?? get.ifSet(this.rsHeight) ?? get.ifSet(this.origHeight);
    };
};
