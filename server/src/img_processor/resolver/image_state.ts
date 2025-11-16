import type sharp from "sharp";

type ImgStateFields = {
    width: number;
    height: number;
    format: string;
};

export class ImgState {
    private state: ImgStateFields;

    constructor(imageMetadata: sharp.Metadata) {
        if (!imageMetadata.width || !imageMetadata.height || !imageMetadata.format) throw new Error("image metdata missing")
        this.state = { ...imageMetadata };
    };

    applyResize({ width, height }: { width?: number, height?: number }) {
        if (width) this.state.width = width;
        if (height) this.state.height = height;
    };

    get width() {
        return this.state.width;
    };
    get height() {
        return this.state.height;
    };
    get format() {
        return this.state.format;
    };
}
