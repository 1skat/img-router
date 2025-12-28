import type sharp from "sharp";
import type { ImgStateFields } from "../types";


export class ImageState {
    state: ImgStateFields;

    constructor(metadata: sharp.Metadata) {
        if (!metadata.width || !metadata.height || !metadata.format) throw new Error("image metdata missing");
        this.state = {
            preLeftOffset: null,
            preTopOffset: null,
            preWidth: null,
            preHeight: null,
            postLeftOffset: null,
            postTopOffset: null,
            postWidth: null,
            postHeight: null,
            rsWidth: null,
            rsHeight: null,
            origWidth: metadata.width,
            origHeight: metadata.height,
        };
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
        // const width = (this.preWidth && !this.rsWidth) ? this.preWidth : this.postWidth ?? this.rsWidth ?? this.origWidth;
        // const height = (this.preHeight && !this.rsHeight) ? this.preHeight : this.postHeight ?? this.rsHeight ?? this.origHeight;

        return this.getCurrWidth / this.getCurrHeight;
    };
    get getCurrWidth() {
        return (this.preWidth && !this.rsWidth) ? this.preWidth : this.postWidth ?? this.rsWidth ?? this.origWidth;
    };
    get getCurrHeight() {
        return (this.preHeight && !this.rsHeight) ? this.preHeight : this.postHeight ?? this.rsHeight ?? this.origHeight;
    };
};
