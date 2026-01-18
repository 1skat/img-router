import { Elysia } from 'elysia';
import { connectRedis } from './internal/db/redis';
import { keyRoutes } from './routes/api_keys';
import { accountRoutes } from './routes/accounts';
import { imageRoutes } from './routes/images';

await connectRedis();
const imageApp = new Elysia()
    .onRequest(({ set }) => {
        set.headers['Accept-CH'] = 'Sec-CH-DPR, Sec-CH-Width, Sec-CH-Viewport-Width';
        console.log("ran");
    })
    .use(imageRoutes)

const apiApp = new Elysia()
    .use(keyRoutes)
    .use(accountRoutes)

imageApp.listen(3001);
apiApp.listen(3002);

console.log("server is running on port 3001");
