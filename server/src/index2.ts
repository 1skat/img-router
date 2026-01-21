import serve from "bun";
import { hostname } from "os";

serve({
    hostname: "0.0.0.0",
    port: 3002,
    routes: {
        "/api/keys": {
            GET: 
        }
    }
});
