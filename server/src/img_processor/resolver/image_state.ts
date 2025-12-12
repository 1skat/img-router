import type sharp from "sharp";

type ImgStateFields = {
    origWidth: number;
    origHeight: number;
    currWidth: number;
    currHeight: number;
    topOffset: number | undefined;
    leftOffset: number | undefined;
    aspectRatio: number;
};

export class ImageState {
    private state: ImgStateFields;

    constructor(metadata: sharp.Metadata) {
        if (!metadata.width || !metadata.height || !metadata.format) throw new Error("image metdata missing");
        this.state = {
            origWidth: metadata.width,
            origHeight: metadata.height,
            currWidth: metadata.width,
            currHeight: metadata.height,
            topOffset: undefined,
            leftOffset: undefined,
            aspectRatio: metadata.width / metadata.height,
        };
    };

    applyResize({ width, height }: { width?: number, height?: number }) {
        if (width) this.state.currWidth = width;
        if (height) this.state.currHeight = height;
    };
    applyOffest({ top, left }: { top?: number, left?: number }) {
        if (left !== undefined) this.state.leftOffset = left;
        if (top !== undefined) this.state.topOffset = top;
    };

    get origWidth() {
        return this.state.origWidth;
    };
    get origHeight() {
        return this.state.origHeight;
    };
    get width() {
        return this.state.currWidth;
    };
    get height() {
        return this.state.currHeight;
    };
    get left() {
        return this.state.leftOffset;
    };
    get top() {
        return this.state.topOffset
    };
    get aspectRatio() {
        return this.state.aspectRatio;
    }
};
