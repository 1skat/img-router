import { cfg, type ApiConfig } from "@/config";
import { BadRequestError, NotFoundError } from "@/errors";
import { respondWithJSON } from "@/utils/response";
import { parsePath } from "@/utils/path_parser";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { S3Client } from "bun";
import path from "path";
import slash from "slash";
import { ParameterParser } from "@/img_processor/input_parser/url_parser";
import { getAccountSettings } from "@/internal/db/redis";
import { getClientHints } from "@/utils/get_client_hints";
import { getBestFormat } from "@/utils/best_format";
import sharp from "sharp";
import fs from "fs";

export async function handlerImage(cfg: ApiConfig, req: Request) {
    const headers = req.headers;
    const rawPath = new URL(req.url).pathname;
    const normalizedPath = path.posix.normalize(slash(rawPath.trim()));

    const [res, parseErr] = tryCatch(() => parsePath(normalizedPath));
    if (parseErr) {
        throw new BadRequestError(parseErr.message);
    };

    const { accountId, fnString, assetPath } = res;
    console.log(`accountId: ${accountId}, fn: ${fnString}, assetPath: ${assetPath}\n`);

    // const s3Ref = cfg.s3.file(assetPath);
    // const [imgBuffer, s3Err] = await tryCatchAsync(() => s3Ref.arrayBuffer());
    // if (s3Err) {
    //     throw new Error(`S3: ${s3Err.message}`);
    // };

    if (!fnString) return; // transfrom from default settings

    const buf = fs.readFileSync(path.join(__dirname, assetPath));
    // const buf = Buffer.from(imgBuffer); // prod
    const accountSettings = await getAccountSettings(cfg, accountId);
    const clientHints = getClientHints(headers);

    // TODO: use signed urls instead to get the accountSettings
    // const settings = {
    //     format: accountSettings.useBestFormat ? getBestFormat(clientHints.userDeviceSupportedFormats, buf) : undefined,
    //     quality: accountSettings.defaultQuality,
    // };

    const [parsedParamChains, paramErr] = tryCatch(() => new ParameterParser().parseParams(fnString));
    if (paramErr) {
        throw new BadRequestError(paramErr.message)
    };

    return respondWithJSON(200, parsedParamChains[0]);
    // const [s3Response, s3Err] = await tryCatchAsync(() => cfg.s3.send(new GetObjectCommand({ Bucket: cfg, Key: assetPath })));
    // if (s3Err) {
    //     set.status = 404;
    //     return { error: s3Err.message }
    // };

    // const imgStream = s3Response.Body;
    // if (!imgStream) {
    //     set.status = 404;
    //     return { error: "S3: failed to get image" };
    // };
}
