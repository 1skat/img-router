import Elysia from "elysia";
import slash from "slash";
import path from "path";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { parsePath } from "@/utils/path_parser";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getAccountSettings } from "../db/redis";
import sharp from "sharp";

const s3 = new S3Client({
    region: Bun.env.S3_REGION,
    credentials: {
        accessKeyId: Bun.env.ACCESS_KEY_ID,
        secretAccessKey: Bun.env.SECRET_ACCESS_KEY,
    },
});

export const imageHandler = new Elysia({ prefix: "/images" })
    .get("/*", async (c) => {
        const rawUserPath = c.params["*"];
        const normalizedPath = path.posix.normalize(slash(rawUserPath.trim()));
        const [res, parseErr] = tryCatch(parsePath(normalizedPath));

        if (parseErr) throw new Error(parseErr.message);

        const { accountID, trString, assetPath } = res;
        const bucketName = Bun.env.S3_BUCKET_NAME;
        console.log(`accountID: ${accountID}, tr: ${trString}, assetPath: ${assetPath}\n`);

        if (!assetPath) throw new Error("Path required");
        if (!bucketName) throw new Error("Bucket name required");

        try {
            const s3Response = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: assetPath }));
            const imgStream = s3Response.Body;
            if (!imgStream) return (c.set.status = 404, { error: "Not found" });

            const [accountSettings, accSettingsErr] = await tryCatchAsync(getAccountSettings(accountID))
            if (accSettingsErr) {
                console.error(accSettingsErr.message);
                return;
            };

            const buf = await imgStream.transformToByteArray();
            let sharpInstance = sharp(buf);
            const imgMetadata = await sharpInstance.metadata();


            const userDeviceSupportedFormats = c.headers["accept"] ?? "";
            const requiredWidth = c.headers["sec-ch-width"] ?? "";
            const dpr = c.headers["sec-ch-dpr"] ?? "";
            const viewportWidth = c.headers["viewport-width"] ?? "";
            const connectionType = c.headers.ect;
            const downloadBandwith = parseFloat(c.headers.downlink ?? "")

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
                "Content-Type": "image/png",
                // "Cache-Control": "public, max-age=3600"
            };
            c.set.status = 200;

            const outBuffer = await sharpInstance.toBuffer();

            return outBuffer;

        } catch (err) {
            console.error("file_handler:", err);
            c.set.status = 404;
            return { error: (err as Error).message ?? err };
        }
    });
