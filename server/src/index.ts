import { Elysia } from 'elysia';
import { connectRedis } from './db/redis';

enum ImageFormat {
    Avif = "avif",
    Webp = "webp",
    Jpeg = "jpeg",
    Png = "png",
}

const DEFAULT_IMG_QUALITY = 80;

function getFormatFromString(formatString: string): ImageFormat | undefined {
    if (formatString.includes("image/avif")) return ImageFormat.Avif;
    if (formatString.includes("image/webp")) return ImageFormat.Webp;
    if (formatString.includes("image/jpeg")) return ImageFormat.Jpeg;
    if (formatString.includes("image/png")) return ImageFormat.Png;
    return undefined;
};

function getBestFormat(acceptHeader: string): ImageFormat {
    if (acceptHeader.includes("image/avif")) return ImageFormat.Avif;
    if (acceptHeader.includes("image/webp")) return ImageFormat.Webp;
    return ImageFormat.Jpeg;
};

export type UserImageSettings = {
    encoding: {
        [method: string]: Record<string, any>,
    }
};

await connectRedis();
const app = new Elysia();


app.listen(3001);
console.log("server is running on port 3001");
