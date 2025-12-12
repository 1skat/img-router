import fs from "fs";
import Elysia from "elysia";
import slash from "slash";
import path from "path";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { parsePath } from "@/utils/path_parser";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from "sharp";
import { getAccountSettings } from "@/internal/db/redis";
import { ParameterParser } from "@/img_processor/parser/param_parser";
import { resolvedSharpInstructions } from "@/img_processor/resolver/main";
import { buildSharpTransformerV2, buildSharpTransformerV3 } from "@/img_processor/ix_builder/build_transform";

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
        console.log(`accountId: ${accountId}, tr: ${trString}, assetPath: ${assetPath}\n`);

        if (!assetPath) throw new Error("Path required");
        if (!bucketName) throw new Error("Bucket name required");

        // const [s3Response, s3Err] = await tryCatchAsync(s3.send(new GetObjectCommand({ Bucket: bucketName, Key: assetPath })));
        // if (s3Err) {
        //     set.status = 404;
        //     return { error: s3Err.message }
        // };

        // const imgStream = s3Response.Body;
        // if (!imgStream) {
        //     set.status = 404;
        //     return { error: "S3: failed to get image" };
        // };

        // Client hints:
        const userDeviceSupportedFormats = headers["accept"] ?? "";

        // Account settings
        const [accSettings, accSettingsErr] = await tryCatchAsync(() => getAccountSettings(accountId))
        if (accSettingsErr) {
            set.status = 404;
            return { error: accSettingsErr.message };
        };

        const { useBestFormat, defaultQuality, dataSaveMode } = accSettings;
        const accountSettings = {
            encoding: {
                format: useBestFormat ? (userDeviceSupportedFormats) : undefined,
                quality: defaultQuality,
            },
        };

        // Production:
        // const buf = await imgStream.transformToByteArray();
        // Dev:
        const imgPath = path.join(import.meta.dir, "audi_main.png");
        const buf = fs.readFileSync(imgPath);

        let sharpInstance = sharp(buf);
        const imgMetadata = await sharpInstance.metadata();

        // 1: prase parameter transformations
        if (!trString) return;
        const [parsedParamChains, paramErr] = tryCatch(() => new ParameterParser().parseParams(trString));
        // console.log(parsedParamChains);
        if (paramErr) {
            set.status = 400;
            return { error: paramErr.message }
        };

        // 2: build transformation instructions for sharp
        const [sharpInstructionChain, resolverErr] = tryCatch(() => resolvedSharpInstructions(imgMetadata, accountSettings, parsedParamChains));
        if (resolverErr) {
            set.status = 400;
            return { error: resolverErr.message };
        };
        // console.log("sharp instuctions", sharpInstructionChain);

        // 3: build sharp transformers from insructions
        const transformers = buildSharpTransformerV3(sharpInstructionChain);


        for (const [i, applyTransform] of transformers.entries()) {
            sharpInstance = applyTransform(sharpInstance);
            const {
                topOffsetPre, leftOffsetPre, widthPre, heightPre,
                topOffsetPost, leftOffsetPost, widthPost, heightPost,
                width, height, canvas, position,
            } = sharpInstance.options;
            const sliced = { topOffsetPre, leftOffsetPre, widthPre, heightPre, topOffsetPost, leftOffsetPost, widthPost, heightPost, width, height, canvas, position };
            console.log(sliced);
        };

        set.headers = {
            "Content-Type": "image/png",
        };
        set.status = 200;

        const outBuffer = await sharpInstance.toBuffer();
        return outBuffer;
    });
