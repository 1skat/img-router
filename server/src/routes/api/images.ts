import { BadRequestError } from "@/errors";
import { requireOwnership, withAuth, withConfig } from "@/middleware";
import { createHmac } from "crypto";
import Elysia, { NotFoundError } from "elysia";
import sharp from "sharp";
import z from "zod";

export const imageHandlers = new Elysia() // e.g /api/danny004/upload
    .use(withConfig)
    .derive(withAuth)
    .group("/:accountName/assets", (app) => app
        .derive(requireOwnership)
        .post("/upload", async ({ cfg, accountId, accountName, body }) => {
            const { file, fileName, folder, isPrivate, transformations } = body;
            console.log("/upload", accountId, accountName, folder, fileName);
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
                throw new BadRequestError("Invalid file type");
            };

            const buf = await file.arrayBuffer();
            // to-do: checl the file size done in cfg
            // validate transformations

            const metadata = await sharp(buf).metadata();

            const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
            const s3Key = `${accountId}/${normalizedFolder}/${fileName}`;

            await cfg.s3.write(s3Key, buf);

            await cfg.db.safeUpsertImage({
                accountId: accountId,
                path: s3Key,
                isPrivate: isPrivate,
                transformations: transformations ?? null,
                fileSize: metadata.size ?? buf.byteLength,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                folder: folder,
                fileName: fileName,
            });

            return { url: `${accountName}/${normalizedFolder}/${fileName}` };
        }, {
            body: z.object({
                file: z.instanceof(File),
                fileName: z.string(),
                folder: z.string().default("/"),
                isPrivate: z.string().transform(val => val === "true").default(false),
                transformations: z.string().optional(),
            })
        })
        .delete("/*", async ({ cfg, accountId, accountName, params }) => {
            const assetPath = params["*"];
            const s3Key = `${accountId}/${assetPath}`;

            await cfg.s3.delete(s3Key);
            console.log(typeof cfg.s3.delete)
            await cfg.db.images.deleteOne({ accountId, path: s3Key });

            return { success: true };
        })
        .patch("/*", async ({ cfg, accountId, accountName, params, body }) => {
            const assetPath = params["*"];
            const s3Key = `${accountId}/${assetPath}`;
            const { isPrivate, transformations } = body;
            console.log("patch:", isPrivate, transformations);
            // todo: validate transformations

            const updatedSet = {
                isPrivate: isPrivate,
                ...(transformations && { transformations }),
                updatedAt: new Date(),
            };

            const result = await cfg.db.images.updateOne(
                { accountId, path: s3Key },
                {
                    $set: updatedSet,
                },
            );

            if (result.matchedCount === 0) {
                throw new NotFoundError("Image not found");
            };

            const publicPath = `${accountName}/${assetPath}`;
            if (isPrivate) {
                const signature = createHmac("sha256", cfg.jwtSecret)
                    .update(`${s3Key}`)
                    .digest("hex")
                    .slice(0, 40);

                return { signedUrl: `${publicPath}?sig=${signature}` };
            };

            return { url: publicPath };
        }, {
            body: z.object({
                isPrivate: z.boolean(),
                transformations: z.string().optional(),
            })
        })
    );

