import fs from "fs";
import Elysia, { NotFoundError } from "elysia";
import slash from "slash";
import path from "path";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { parsePath } from "@/utils/path_parser";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from "sharp";
import { getAccountSettings } from "@/internal/db/redis";
import { resolveSharpInstructionsV2 } from "@/img_processor/resolver/resolver";
import { buildSharpTransformer } from "@/img_processor/ix_builder/build_transform";
import { ParameterParser } from "@/img_processor/input_parser/url_parser";
import { getBestFormat } from "@/utils/best_format";
import { getClientHints } from "@/utils/get_client_hints";
import { withConfig } from "@/middleware";
import { BadRequestError } from "@/errors";
import type { ApiConfig } from "@/config";



export const imageHandler = new Elysia()
    .use(withConfig)
    .get("/*", async ({ cfg, headers, params, set }) => {
        const rawUserPath = params["*"];
        const normalizedPath = path.posix.normalize(slash(rawUserPath.trim()));
        const [res, parseErr] = tryCatch(parsePath(normalizedPath));

        if (parseErr) {
            throw new BadRequestError(parseErr.message);
        };

        const { accountName, fnString, assetPath } = res;
        console.log(`accountName: ${accountName}, fn: ${fnString}, assetPath: ${assetPath}\n`);

        if (!fnString) return; // transfrom from default settings

        // const s3Ref = cfg.s3.file(assetPath);
        // const [imgBuffer, s3Err] = await tryCatchAsync(() => s3Ref.arrayBuffer());
        // if (s3Err) {
        //     throw new Error(`S3: ${s3Err.message}`);
        // };

        // const buf = Buffer.from(imgBuffer); // prod

        // Parsing parameters
        const [parsedParamChains, paramErr] = tryCatch(() => new ParameterParser().parseParams(fnString));
        if (paramErr) {
            throw new BadRequestError(paramErr.message)
        };

        // Get account settings
        const buf = fs.readFileSync(path.join(__dirname, assetPath));
        const accountSettings = await getSettings(cfg, accountName);
        const clientHints = getClientHints(headers);

        const [finalBuf, resolverErr] = await tryCatchAsync(() => resolveSharpInstructionsV2(buf, parsedParamChains, accountSettings));
        if (resolverErr) {
            set.status = 400;
            return { error: resolverErr.message };
        };

        const meta = await sharp(finalBuf).metadata();
        set.headers = {
            "Content-Type": `image/${meta.format}`,
            "Vary": "Accept",
        };
        set.status = 200;

        return finalBuf;
    });

async function getSettings(cfg: ApiConfig, accountName: string) {
    const cached = cfg.lruCache.get(accountName);
    if (cached) return cached;

    const accountId = await cfg.db.get(`accountName:${accountName}`);
    if (!accountId) {
        throw new NotFoundError("Account name not found");
    };

    const settings = await getAccountSettings(cfg, accountId)
    cfg.lruCache.set(accountName, settings);
    return settings;
}
