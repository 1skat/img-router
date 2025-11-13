import Elysia from "elysia";
import slash from "slash";
import path from "path";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { parsePath } from "@/utils/path_parser";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from "sharp";
import { getAccountSettings } from "@/internal/db/redis";
import { ParameterParser } from "@/img_processor/parser/param_parser";
import { TransformationResolver } from "@/img_processor/resolver/resolver";

const s3 = new S3Client({
    region: Bun.env.S3_REGION,
    credentials: {
        accessKeyId: Bun.env.ACCESS_KEY_ID,
        secretAccessKey: Bun.env.SECRET_ACCESS_KEY,
    },
});

export const imageRoutes = new Elysia()
    .get("/*", async ({ headers, params, set }) => {
        const rawUserPath = params["*"];
        const normalizedPath = path.posix.normalize(slash(rawUserPath.trim()));
        const [res, parseErr] = tryCatch(parsePath(normalizedPath));

        if (parseErr) throw new Error(parseErr.message);

        const { accountId, trString, assetPath } = res;
        const bucketName = Bun.env.S3_BUCKET_NAME;
        console.log(bucketName);
        console.log(`accountId: ${accountId}, tr: ${trString}, assetPath: ${assetPath}\n`);

        if (!assetPath) throw new Error("Path required");
        if (!bucketName) throw new Error("Bucket name required");

        try {
            const s3Response = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: assetPath }));
            const imgStream = s3Response.Body;
            if (!imgStream) {
                set.status = 404;
                return { error: "S3: failed to get image" };
            };

            // Client hints:
            const userDeviceSupportedFormats = headers["accept"] ?? "";

            // Account settings
            const [accSettings, accSettingsErr] = await tryCatchAsync(getAccountSettings(accountId))
            if (accSettingsErr) {
                set.status = 404;
                return { error: accSettingsErr.message };
            };

            const { useBestFormat, defaultQuality, dataSaveMode } = accSettings;
            const userSettings = {
                encoding: {
                    format: useBestFormat ? (userDeviceSupportedFormats) : undefined,
                    quality: defaultQuality,
                },
            };

            const buf = await imgStream.transformToByteArray();
            let sharpInstance = sharp(buf);
            const imgMetadata = await sharpInstance.metadata();

            // 1: prase parameter transformations
            const parsedParamChains = trString ? new ParameterParser().parseParams(trString) : null;
            console.log(`parsed params: ${parsedParamChains}`);

            // // 2: build transformation instruction
            // const normalizedTransformChains = new TransformationResolver(imgMetadata, userSettings).resolve(parsedParamChains)
            // const transformers = buildSharpTransformerV2(normalizedTransformChains);

            // for (const applyTransform of transformers) sharpInstance = applyTransform(sharpInstance);

            // c.set.headers = {
            //     "Content-Type": "image/png",
            //     // "Cache-Control": "public, max-age=3600"
            // };
            // c.set.status = 200;

            // const outBuffer = await sharpInstance.toBuffer();

            // return outBuffer;

        } catch (err) {
            console.error("file_handler:", err);
            set.status = 404;
            return { error: (err as Error).message ?? err };
        }
    });
