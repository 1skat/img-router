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
            extendTop: undefined,
            extendBottom: undefined,
            extendLeft: undefined,
            extendRight: undefined,
            extendBackground: undefined,
            rotateAngle: 0,
            rotateBackground: undefined,
            rotateBefore: false,
        };
    };

    get isRotated() {
        return (this.state.rotateAngle % 360) !== 0;
    };
    get isRsized() {
        return this.state.rsWidth !== -1 || this.state.rsHeight !== -1;
    };
    get isPreExtracted() {
        return is.set(this.state.preWidth) && is.set(this.state.preHeight);
    };
    get isPostExtracted() {
        return is.set(this.state.postWidth) && is.set(this.state.postHeight);
    };

    get getCurrWidthV2() {
        const rad = (this.state.rotateAngle * Math.PI) / 180;
        return Math.round(
            Math.abs(this.getCurrWidth * Math.cos(rad)) +
            Math.abs(this.getCurrHeight * Math.sin(rad))
        );  // collecting all cos
    };
    get getCurrHeightV2() {
        const rad = (this.state.rotateAngle * Math.PI) / 180;
        return Math.round(
            Math.abs(this.getCurrWidth * Math.sin(rad)) +
            Math.abs(this.getCurrHeight * Math.cos(rad))
        );
    };
    get getAspectRatio() {
        return this.getCurrWidthV2 / this.getCurrHeightV2;
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

    get isExtended() {
        return (this.state.extendTop || this.state.extendBottom || this.state.extendLeft || this.state.extendRight);
    };

};
