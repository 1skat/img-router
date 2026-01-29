import { serve } from "bun";
import { hostname } from "os";
import { handlerServerError, requireOwnership, withAuth, withConfig } from "./middleware";
import { cfg } from "./config";
import { handlerCreateAccount, handlerGetAccountSettings, handlerKeys, handlerUpdateAccountSettings } from "./routes/accountsV2";
import { handlerImage } from "./routes/img";

try {
    await cfg.db.connect();
    console.log("Redis connected successfully");
} catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
}

async function startSevers() {
    serve({
        hostname: "0.0.0.0",
        port: cfg.apiPort,
        routes: {
            "/api/keys": {
                POST: withConfig(cfg, handlerKeys),
            },
            "/api/accounts": {
                POST: withConfig(cfg, withAuth(handlerCreateAccount)),
            },
            "/api/accounts/:name/settings": {
                GET: withConfig(cfg, withAuth(requireOwnership(handlerGetAccountSettings))),
                POST: withConfig(cfg, withAuth(requireOwnership(handlerUpdateAccountSettings)))
            },
        },
        error(err) {
            return handlerServerError(err);
        },
    });
    console.log("bun server on port 3002");

    serve({
        hostname: "0.0.0.0",
        port: cfg.imgPort,
        routes: {
            "/*": {
                GET: withConfig(cfg, handlerImage)
            },
        },
        error(err) {
            console.error(err.message);
            return handlerServerError(err);
        },
    });
    console.log("bun server on port 3001");
};
startSevers();
