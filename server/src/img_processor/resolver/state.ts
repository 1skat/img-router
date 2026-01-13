import type sharp from "sharp";
import type { ImgStateFields } from "./types";
import { get, is } from "./helpers";
import { ImageStateMap } from "./hashmaps";
import type { AddInstructionType } from "./state_handlers/types";

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
            flip: false,
            flop: false,
            formatOut: undefined,
            formatQuality: undefined,
        };
    };

    get isFlipedORFloped() {
        return this.state.flip || this.state.flop;
    };
    get isRotated() {
        return (this.state.rotateAngle % 360) !== 0;
    };
    get isRsized() {
        return is.set(this.state.rsWidth) && is.set(this.state.rsHeight);
    };
    get isPreExtracted() {
        return is.set(this.state.preWidth) && is.set(this.state.preHeight);
    };
    get isPostExtracted() {
        return is.set(this.state.postWidth) && is.set(this.state.postHeight);
    };

    get getCurrWidthV2() {
        const rad = (this.state.rotateAngle * Math.PI) / 180;
        const rtW = (w: number, h: number) => (Math.round(
            Math.abs(w * Math.cos(rad)) +
            Math.abs(h * Math.sin(rad))
        ));

        if (!this.isPreExtracted && !this.isRsized) { // original
            return this.isRotated ? rtW(this.state.origWidth, this.state.origHeight) : this.state.origWidth;
        };
        if (this.isPreExtracted && !this.isRsized) {
            // return this.state.preWidth;
            return (this.isRotated && !this.state.rotateBefore) ? rtW(this.state.preWidth, this.state.preHeight) : this.state.preWidth;
        };
        if (this.isPostExtracted) {
            return this.state.postWidth;
        };
        return this.state.rsWidth;
    };
    get getCurrHeightV2() {
        const rad = (this.state.rotateAngle * Math.PI) / 180;
        const rtH = (w: number, h: number) => (Math.round(
            Math.abs(w * Math.sin(rad)) +
            Math.abs(h * Math.cos(rad))
        ));

        if (!this.isPreExtracted && !this.isRsized) { // original
            return this.isRotated ? rtH(this.state.origWidth, this.state.origHeight) : this.state.origHeight;
        };
        if (this.isPreExtracted && !this.isRsized) { // preWdith
            return (this.isRotated && !this.state.rotateBefore) ? rtH(this.state.preWidth, this.state.preHeight) : this.state.preHeight;
        };
        if (this.isPostExtracted) {
            return this.state.postHeight;
        };
        return this.state.rsHeight;
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

    updateState<K extends keyof AddInstructionType>(sharpMethod: K, methodArgs: AddInstructionType[K]) {
        const applier = ImageStateMap[sharpMethod];
        if (!applier) throw new Error(`failed to get state handler for ${sharpMethod}`);

        applier(this, methodArgs);
    };
};
