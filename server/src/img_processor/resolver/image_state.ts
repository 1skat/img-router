import type sharp from "sharp";

export type ImgStateFields = {
    preLeftOffset: number | null;
    preTopOffset: number | null;
    preWidth: number | null;
    preHeight: number | null;
    postLeftOffset: number | null;
    postTopOffset: number | null;
    postWidth: number | null;
    postHeight: number | null;
    rsWidth: number | null;
    rsHeight: number | null;
    origWidth: number;
    origHeight: number;
    // topOffset: number | null;
    // leftOffset: number | null;
    aspectRatio: number;
};


export class ImageState {
    private state: ImgStateFields;

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
            aspectRatio: metadata.width / metadata.height,
            // topOffset: null,
            // leftOffset: null,
        };
    };

    // applyExtract({ width, height, x, y }: { width: number, height: number, x: number, y: number }) {
    //     if (width == null || height == null || x == null || y == null) throw new Error('applyExtract requires width, height, x and y');

    //     this.state.preWidth = this.state.preWidth ?? (!this.state.rsWidth ? width : null);
    //     this.state.postWidth = (this.state.preWidth && this.state.rsWidth) ? width : null;
    //     this.state.preHeight = this.state.preHeight ?? (!this.state.rsHeight ? height : null);
    //     this.state.postHeight = (this.state.preHeight && this.state.rsHeight) ? height : null;

    //     this.state.preLeftOffset = this.state.preLeftOffset ?? (!this.state.rsWidth ? x : null);
    //     this.state.postLeftOffset = (this.state.preLeftOffset && this.state.rsWidth) ? x : null;
    //     this.state.preTopOffset = this.state.preTopOffset ?? (!this.state.rsWidth ? y : null);
    //     this.state.postTopOffset = (this.state.preTopOffset && this.state.rsWidth) ? y : null;
    // };

    // applyResize({ width, height }: { width?: number, height?: number }) {
    //     if (width) this.state.rsWidth = width;
    //     if (height) this.state.rsHeight = height;
    // };

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
    get aspectRatio() {
        return this.state.aspectRatio;
    }
};
