import { Elysia } from 'elysia';
import { connectRedis } from './internal/db/redis';
import { keyRoutes } from './routes/api_keys';
import { accountRoutes } from './routes/accounts';
import { imageRoutes } from './routes/images';
import { hostname } from 'os';

await connectRedis();
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
    .use(keyRoutes)
    .use(accountRoutes)

imageApp.listen({
    hostname: "0.0.0.0",
    port: 3001
});

apiApp.listen({
    hostname: "0.0.0.0",
    port: 3002
});

console.log("server is running on port 3001");
