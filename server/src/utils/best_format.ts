import type { SupportedImageFormat } from "@/img_processor/resolver/types";
import sharp from "sharp";

const WEBP = "webp";
const AVIF = "avif";
const PNG = "png";
const JPEG = "jpeg";
const GIF = "gif";
const SVG = "svg";

export async function getBestFormat(supported: string | undefined, metadata: sharp.Metadata) {
    if (!supported || !metadata) return null;

    const accepts = supported.toLowerCase();
    const originalFormat = metadata.format;

    if (originalFormat === "svg") return null;

    const supportsAvif = accepts.includes('image/avif');
    const supportsWebP = accepts.includes('image/webp');
    const isAnimated = (metadata.pages || 0) > 1;
    const isTiny = (metadata.width * metadata.height) < 200 * 200;

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
        if (metadata.isPalette || metadata.hasAlpha) {
            return PNG;
        };

        return JPEG;
    };

    const bestF = decideFormat();
    if (bestF !== originalFormat) {
        return bestF;
    };

    return null;
};

