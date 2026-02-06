// import { tryCatchAsync } from "@/utils/try-catch";
// import Elysia from "elysia";
// import { proveOwnership, verifyApiKey } from "@/internal/db/redis"

// export const withAuth = (app: Elysia) =>
//     app.derive(async ({ headers, set }) => {
//         const apiKey = headers["x-api-key"];
//         if (!apiKey) {
//             set.status = 401;
//             throw new Error("Missing x-api-key header")
//         };

//         const [_, err] = await tryCatchAsync(() => verifyApiKey(apiKey));
//         if (err) {
//             set.status = 401;
//             throw new Error("invalid api key")
//         };

//         return { apiKey };
//     });

// export const requireOwnership = (app: Elysia) =>
//     app.derive(async ({ apiKey, params, set }) => {
//         const accountId = params.id;
//         if (!accountId) throw new Error("account id required");

//         const owns = await proveOwnership(apiKey, accountId);
//         if (!owns) {
//             set.status = 403;
//             throw new Error("access denied");
//         };
//     });



