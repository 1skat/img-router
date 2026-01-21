import sharp from "sharp";
import type { ClientHints } from "./get_client_hints";

const WEBP = "webp";
const AVIF = "avif";
const PNG = "png";
const JPEG = "jpeg";
const GIF = "gif";
const SVG = "svg";

export async function getBestFormat(supported: string | undefined, buf: Buffer) {
    const meta = await sharp(buf).metadata();
    if (!supported || !meta) return;

    const accepts = supported.toLowerCase();

    if (meta.format === "svg") {
        return undefined
    };

    const supportsAvif = accepts.includes('image/avif');
    const supportsWebP = accepts.includes('image/webp');
    const isAnimated = (meta.pages || 0) > 1;
    const isTiny = (meta.width * meta.height) < 200 * 200;

    const decideFormat = () => {
        if (isAnimated) {
            if (supportsWebP) return WEBP;
            return GIF;
        };
        if (supportsAvif && !isTiny) {
            return AVIF;
        };
        if (supportsWebP) {
            return WEBP;
        };
        if (meta.isPalette || meta.hasAlpha) {
            return PNG;
        };

        return JPEG;
    };

    const bestF = decideFormat();
    if (bestF !== meta.format) {
        return bestF;
    };

    return undefined
};

