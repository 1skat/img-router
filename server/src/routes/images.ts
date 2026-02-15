import fs from "fs";
import Elysia, { NotFoundError } from "elysia";
import slash from "slash";
import path from "path";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { parsePath } from "@/utils/path_parser";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from "sharp";
import { resolveSharpInstructions } from "@/img_processor/resolver/resolver";
import { buildSharpTransformer } from "@/img_processor/ix_builder/build_transform";
import { ParameterParser } from "@/img_processor/input_parser/url_parser";
import { getBestFormat } from "@/utils/best_format";
import { getClientHints } from "@/utils/get_client_hints";
import { BadRequestError } from "@/errors";
import type { ApiConfig } from "@/config";
import { withConfig } from "@/middleware";
import { getAccountIdFromName, getAccountSettings } from "@/internal/db";
import type { ResolverContext } from "@/img_processor/resolver/types";

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

        const buf = fs.readFileSync(path.join(__dirname, assetPath));
        const imgMetadata = await sharp(buf).metadata();

        // Account settings
        const acccountId = await getAccountIdFromName(cfg, accountName);
        const accountSettings = await getAccountSettings(cfg, acccountId);
        const clientHints = getClientHints(headers);

        const bestFormat = await getBestFormat(clientHints.userDeviceSupportedFormats, imgMetadata);
        const resolverCtx: ResolverContext = {
            encoding: {
                format: accountSettings.useBestFormat ? bestFormat : null,
                quality: accountSettings.defaultQuality,
            },
        };
        // const imageFormat = accountSettings.useBestFormat ? getBestFormat(clientHints.userDeviceSupportedFormats, buf)

        // const resolverCtx: ResolverContext = {
        //     encoding: {
        //         format: getBestFormat(clientHints.userDeviceSupportedFormats) ?? accountSettings.
        //     }
        // }

        const [finalBuf, resolverErr] = await tryCatchAsync(() => resolveSharpInstructions(buf, parsedParamChains, resolverCtx));
        if (resolverErr) {
            throw new Error(resolverErr.message);
        };

        const meta = await sharp(finalBuf).metadata();
        set.headers = {
            "Content-Type": `image/${meta.format === "heif" ? "avif" : meta.format}`,
            "Vary": "Accept",
        };

        return finalBuf;
    });
