import { Elysia } from 'elysia';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from "sharp";
import { z } from "zod";
import slash from "slash";
import path from "path";
import { TransformationResolver } from './resolver_v1/resolver';
import { buildSharpTransformerV2 } from './build_transform';
import { TranformationParser } from './url_parser';
import { tryCatch } from '@/utils/try-catch';

console.log(Bun.env.YC_ACCESS_KEY_ID);
console.log(Bun.env.YC_SECRET_ACCESS_KEY);

const s3 = new S3Client({
    endpoint: "https://storage.yandexcloud.net",
    region: "ru-central1",
    credentials: {
        accessKeyId: Bun.env.YC_ACCESS_KEY_ID,
        secretAccessKey: Bun.env.YC_SECRET_ACCESS_KEY,
    },
});

const PathMatchSchema = z.object({
    full: z.string(),
    userID: z.string(),
    trString: z.string().optional(),
    assetPath: z.string(),
});

function parsePath(fullPath: string): { userID: string, trString: string | null, assetPath: string } {
    const match = fullPath.match(/^\/?([^/]+)\/(?:tr:([^/]+)\/)?(.+)$/);
    if (!match) throw new Error("Invalid path");

    const pathMatch = PathMatchSchema.safeParse({
        full: match[0],
        userID: match[1],
        trString: match[2],
        assetPath: match[3],
    });

    if (!pathMatch.success) throw new Error("parsePath:", pathMatch.error);

    return {
        userID: pathMatch.data.userID,
        trString: pathMatch.data.trString ?? null,
        assetPath: pathMatch.data.assetPath,
    };
};

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

const app = new Elysia();

let totalJobs = 0;
let connJobs = 0;
app.get("/*", async (c) => {
    const rawUserPath = c.params["*"];
    const normalizedPath = path.posix.normalize(slash(rawUserPath.trim()));
    const [res, parseErr] = tryCatch(parsePath(normalizedPath));

    if (parseErr) throw new Error(parseErr.message);

    const { userID, trString, assetPath } = res;
    console.log(`userID: ${userID}, tr: ${trString}, assetPath: ${assetPath}\n`);

    if (!assetPath) throw new Error("Path required");
    totalJobs++
    connJobs++
    console.log("CURRENT JOBS", connJobs)

    try {
        const s3Response = await s3.send(new GetObjectCommand({ Bucket: "is-bucket", Key: `${userID}/${assetPath}` }));
        const imgStream = s3Response.Body;
        if (!imgStream) return (c.set.status = 404, { error: "Not found" });

        const buf = await imgStream.transformToByteArray();

        let sharpInstance = sharp(buf);

        const imgMetadata = await sharpInstance.metadata();

        /* FROM DB */
        const userAutocompression = true;
        const userQuality = 85;
        /* FROM DB */

        const userDeviceSupportedFormats = c.headers["accept"] ?? "";
        console.log(userDeviceSupportedFormats);

        const userSettings = {
            encoding: {
                format: userAutocompression ? getBestFormat(userDeviceSupportedFormats) : undefined,
                quality: userQuality ?? DEFAULT_IMG_QUALITY,
            },
        };

        const parsedInputChains = trString ? new TranformationParser().parseTransformationString(trString) : null;
        const normalizedTransformChains = new TransformationResolver(imgMetadata, userSettings).resolve(parsedInputChains);
        const transformers = buildSharpTransformerV2(normalizedTransformChains);

        for (const applyTransform of transformers) sharpInstance = applyTransform(sharpInstance);

        c.set.headers = {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=3600"
        };
        c.set.status = 200;

        const outBuffer = await sharpInstance.toBuffer();

        return outBuffer;

    } catch (err) {
        console.error("file_handler:", err);
        c.set.status = 404;
        return { error: (err as Error).message ?? err };
    } finally {
        connJobs--
        console.log(`REMAINING JOBS:${connJobs} TOTAL: ${totalJobs}`);
    };
});

app.listen(3001);
console.log("server is running on port 3001");
