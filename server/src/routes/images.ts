import fs from "fs";
import Elysia from "elysia";
import slash from "slash";
import path from "path";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { parsePath } from "@/utils/path_parser";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from "sharp";
import { getAccountSettings } from "@/internal/db/redis";
import { resolveSharpInstructions, resolveSharpInstructionsV2 } from "@/img_processor/resolver/resolver";
import { buildSharpTransformer } from "@/img_processor/ix_builder/build_transform";
import { ParameterParser } from "@/img_processor/input_parser/url_parser";
import { getBestFormat } from "@/utils/best_format";
import { getCallSites } from "util";
import { getClientHints } from "@/utils/get_client_hints";

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

        // 1: prase parameter transformations
        if (!trString) return;
        const [parsedParamChains, paramErr] = tryCatch(() => new ParameterParser().parseParams(trString));
        if (paramErr) {
            set.status = 400;
            return { error: paramErr.message }
        };

        const buf = fs.readFileSync(path.join(__dirname, assetPath));
        // const buf = await imgStream.transformToByteArray();

        // let sharpInstance = sharp(buf);
        // const imgMetadata = await sharpInstance.metadata();

        // Account settings
        const [accSettings, accSettingsErr] = await tryCatchAsync(() => getAccountSettings(accountId))
        if (accSettingsErr) {
            set.status = 404;
            return { error: accSettingsErr.message };
        };

        const clientHints = getClientHints(headers);
        console.log("HINTS", clientHints);

        const settings = {
            format: accSettings.useBestFormat ? getBestFormat("", buf) : undefined,
            quality: accSettings.defaultQuality,
        };

        // 2: build transformation instructions for sharp
        const [finalBuf, resolverErr] = await tryCatchAsync(() => resolveSharpInstructionsV2(buf, parsedParamChains, settings));
        if (resolverErr) {
            set.status = 400;
            return { error: resolverErr.message };
        };

        // // 3: build sharp transformers from insructions
        // const transformers = buildSharpTransformer(sharpInstructionChain);

        // for (const [i, applyTransform] of transformers.entries()) {
        //     sharpInstance = applyTransform(sharpInstance);
        //     const {
        //         leftOffsetPre, topOffsetPre, topOffset, widthPre, heightPre,
        //         leftOffsetPost, topOffsetPost, widthPost, heightPost,
        //         width, height, canvas, position, resizeBackground, angle, rotationAngle, rotationBackground, rotateBefore, orientBefore
        //     } = sharpInstance.options;
        //     const sliced = { leftOffsetPre, topOffsetPre, widthPre, heightPre, leftOffsetPost, topOffsetPost, widthPost, heightPost, width, height, canvas, position, resizeBackground, angle, rotationAngle, rotationBackground, rotateBefore, orientBefore };
        //     // console.log(sliced);
        //     console.log(sharpInstance.options);
        // };


        const meta = await sharp(finalBuf).metadata();
        set.headers = {
            "Content-Type": `image/${meta.format}`,
        };
        set.status = 200;

        return finalBuf;
        // const outBuffer = await sharpInstructionChain;
        // const outBuffer = await sharpInstance.toBuffer();
        // return outBuffer;
    });
