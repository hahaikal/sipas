import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

const redisClient = createClient({ url: redisUrl });

redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('ready', () => console.log('Redis client ready'));
redisClient.on('end', () => console.log('Redis client disconnected'));
redisClient.on('reconnecting', () => console.log('Redis client reconnecting'));
redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        console.log('Connecting to Redis...');
        await redisClient.connect();
    }
};

export { redisClient, connectRedis };