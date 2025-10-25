import { option } from "@coral-xyz/borsh";
import sharp from "sharp";

type ImgStateFields = {
    width: number;
    height: number;
    format: string;
};

export class ImgStateV2 {
    private _state: ImgStateFields;
    constructor(s: ImgStateFields) {
        this._state = { ...s };
    };

    applyResize({ width, height }: { width?: number, height?: number }) {
        if (width) this._state.width = width;
        if (height) this._state.height = height;
    };

    get width() {
        return this._state.width;
    };
    get height() {
        return this._state.height;
    };
    get format() {
        return this._state.format;
    };
}

export class TransformationResolver {
    state: ImgStateV2;
    userSettings: any;
    params: any;
    instructions: any;

    constructor(meta: sharp.Metadata, userSettings?: any) {
        this.state = new ImgStateV2({
            width: meta.width ?? 0,
            height: meta.height ?? 0,
            format: meta.format ?? "",
        });
        this.userSettings = userSettings ?? {};
        this.params = {};
    };

    transformHandlers: any = {
        rs: this.resolveResize.bind(this),
        ar: this.resolveAspectRatio.bind(this),
        fit: this.resolveFit.bind(this),
        extr: this.resolveExtract.bind(this),
        pad: this.resolvePad.bind(this),
        f: this.resolveFormat.bind(this),
        q: this.resolveQuality.bind(this),
        z: this.resolveZoom.bind(this),
        bg: this.resolveBackground.bind(this),
    };

    resolve(parsedParamChains: any) {
        const instructionsChains = [];
        parsedParamChains.forEach((chain) => {
            this.params = this.toObject(chain)
            const supportedMethods = Object.keys(this.transformHandlers);
            this.instructions = {};

            for (const key of supportedMethods) {
                if (this.params[key]) this.transformHandlers[key](this.params[key]);
            };

            instructionsChains.push(this.instructions);
        });

        return instructionsChains;
    };

    toObject(parsed: any) {
        return parsed.reduce((acc, { key, value }) => {
            acc[key] = value;
            return acc;
        }, {});
    };

    resolveBackground(value: any) {
        const content = { background: value };
        if (this.params.fit) this.addOrMerge("resize", content);
        if (this.params.pad) this.addOrMerge("extend", content);
    };

    resolvePad(value: any) {
        const content: any = { ...value };
        this.addOrMerge("extend", content);
    };

    resolveZoom(value: any) {
        if (this.params.rs) return;
        this.applyZoom(value);// apply to curren image
    };

    resolveFormat(value: any) {
        const MODIFIERS = ["q"];
        const mods = this.getModifiers(MODIFIERS);
        const { format } = value;

        const targetFormat = (format === "auto")
            ? (this.userSettings.encoding.format ?? this.state.format)
            : format;

        const targetQuality = mods.q?.quality ?? this.userSettings.encoding.quality;

        this.addOrMerge("toFormat", { id: targetFormat, options: { quality: targetQuality } });
    };

    resolveQuality(value: any) {
        if (this.params.f) return; // resolveFormat will handle it
        const { quality } = value;

        const format = this.userSettings.format /* best format */ ?? this.state.format;
        if (!format) throw new Error("failed to detect image's format");

        this.addOrMerge("toFormat", { id: format, options: { quality: quality } });
    };

    resolveExtract(value: any) {
        const content: any = { ...value };
        const centerCoords = (imgSize: number, boxSize: number) => (Math.floor((imgSize - boxSize) / 2));

        content.left ??= centerCoords(this.state.width, content.width);
        content.top ??= centerCoords(this.state.height, content.height);

        this.addOrMerge("extract", content);
    };

    resolveFit(value: any) {
        this.addOrMerge("resize", value);
    };

    resolveResize(value: any) {
        const MODIFIERS = ["ar", "z"];
        const mods = this.getModifiers(MODIFIERS);
        const { ar, z } = mods;

        const newDimensions = this.adjustDemensions(value);
        if (!newDimensions) throw new Error("failed to adjust w & h");

        const content: any = { width: newDimensions.width, height: newDimensions.height };

        if (ar) this.applyAspectRatio(content, ar);

        this.addOrMerge("resize", content);
        console.log("before zoom:", content);
        this.state.applyResize({ width: content.width, height: content.height });

        if (z) this.applyZoom(z);
    };

    adjustDemensions(value: any) {
        const { width, height } = value;
        const orgAspectRatio = this.state.width / this.state.height;

        if (width && height) return { width, height };
        if (width && !height) return { width: width, height: Math.floor(width / orgAspectRatio) };
        if (!width && height) return { width: Math.floor(height * orgAspectRatio), height };
        else return undefined;
    };

    applyZoom(value: any) {
        const { zoom, x, y } = value;

        const targetWidth = Math.round(this.state.width * zoom);
        const targetHeight = Math.round(this.state.height * zoom);

        const left = (x && x > 0) ? x : Math.floor((targetWidth - this.state.width) / 2);
        const top = (y && y > 0) ? y : Math.floor((targetHeight - this.state.height) / 2);

        if (left < 0 || top < 0) throw new Error("failed zooming");

        this.addOrMerge("resize", { width: targetWidth, height: targetHeight });
        console.log("after zoom", targetWidth, targetWidth);
        this.addOrMerge("extract", { top: top, left: left, width: this.state.width, height: this.state.height });
    };


    resolveAspectRatio(value: any) {
        if (this.params.rs) return; // rs will handle it

        const content: any = {};
        const { wRatio, hRatio } = value;

        const calculated = this.calcARFromOriginal(wRatio, hRatio);

        content.width = calculated.width;
        content.height = calculated.height;

        this.addOrMerge("resize", content);
        this.state.applyResize({ width: content.width, height: content.height })
    };

    applyAspectRatio(result: any, ar: any) {
        if (!ar) return;
        const { width, height } = result;
        const { wRatio, hRatio } = ar;

        if (width && height) return; // both present, 'ar' ignored
        if (width) result.height = Math.floor((width * hRatio) / wRatio);
        if (height) result.width = Math.floor((height * wRatio) / hRatio);
    };

    calcARFromOriginal(wRatio: any, hRatio: any) {
        const { width, height } = this.state;
        const currRatio = width / height;
        const targetRatio = wRatio / hRatio;

        let newWidth, newHeight;

        if (currRatio > targetRatio) {
            // Image is wider - constrain by height
            newHeight = height;
            newWidth = Math.floor(height * targetRatio);
        } else {
            // Image is taller - constrain by width
            newWidth = width;
            newHeight = Math.floor(width / targetRatio);
        };

        return { width: newWidth, height: newHeight };
    };

    getModifiers(allowedMods: any) {
        const res: any = {};
        for (const mod of allowedMods) {
            if (this.params[mod]) res[mod] = this.params[mod];
        }
        return res;
    };

    addOrMerge(method: string, content: any) {
        if (!this.instructions[method]) this.instructions[method] = {};
        Object.assign(this.instructions[method], content);
    };
}
