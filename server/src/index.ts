import { Elysia } from 'elysia';
import { keyHandlers } from './routes/api_keys';
import { imageRoutes } from './routes/images';
import { hostname } from 'os';
import { handlerServerError } from './middleware';
import { cfg } from './config';
import { accountHandlers } from './routes/accounts';

try {
    await cfg.db.connect();
    console.log("Redis connected successfully");
} catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
};

const imageApp = new Elysia()
    .onRequest(({ set }) => {
        set.headers['Accept-CH'] = [
            'Sec-CH-DPR',
            'Sec-CH-Width',
            'Sec-CH-Viewport-Width',
            'Save-Data',
            'ECT',
            'RTT',
            'Downlink'
        ].join(', ');
        set.headers['Vary'] = [
            'Sec-CH-DPR',
            'Sec-CH-Width',
            'Sec-CH-Viewport-Width',
            'Save-Data',
            'ECT',
            'RTT',
            'Downlink'
        ].join(', ');
    })
    .use(imageRoutes)

const apiApp = new Elysia({ prefix: "/api" })
    .onError(handlerServerError)
    .use(keyHandlers)
    .use(accountHandlers)

imageApp.listen({
    hostname: "0.0.0.0",
    port: 3001
});
console.log("server is running on port 3001");

apiApp.listen({
    hostname: "0.0.0.0",
    port: 3002
});
console.log("server is running on port 3002");

