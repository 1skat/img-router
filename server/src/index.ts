import { serve } from "bun";
import { hostname } from "os";
import { handlerKeys } from "./routes/api_keysV2";
import { connectRedis } from "./internal/db/redis";
import { handlerServerError, requireOwnership, withAuth, withConfig } from "./middleware";
import { cfg } from "./configs/api_config";
import { handlerCreateAccount, handlerGetAccountSettings } from "./routes/accountsV2";

await connectRedis();
console.log("redis started");
console.log("cfg:", Object.keys(cfg).filter(key => cfg[key] !== null));

serve({
    hostname: "0.0.0.0",
    port: cfg.port,
    routes: {
        "/api/keys": {
            POST: withConfig(cfg, handlerKeys),
        },
        "/api/accounts": {
            POST: withConfig(cfg, withAuth(handlerCreateAccount))
        },
        "/api/accounts/:name/settings": {
            GET: withConfig(cfg, withAuth(requireOwnership(handlerGetAccountSettings)))
        }
    },
    error(err) {
        return handlerServerError(cfg, err)
    },
});
console.log("bun server on port 3002");
