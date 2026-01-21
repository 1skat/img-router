import serve from "bun";
import { hostname } from "os";
import { handlerKeys } from "./routes/api_keysV2";
import { connectRedis } from "./internal/db/redis";
import { withConfig } from "./middleware";
import { cfg } from "./configs/api_config";

await connectRedis();

serve({
    hostname: "0.0.0.0",
    port: 3002,
    routes: {
        "/api/keys": {
            GET: withConfig(cfg, handlerKeys),
        },
        "/api/accounts"
    }
});
