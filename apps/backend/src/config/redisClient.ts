import { Redis } from '@upstash/redis';

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!upstashUrl || !upstashToken) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in .env');
}

const redisClient = new Redis({
  url: upstashUrl,
  token: upstashToken,
});

const connectRedis = async () => {
  try {
    await redisClient.ping();
    console.log('Connected to Upstash Redis successfully');
  } catch (error) {
    console.error('Failed to connect to Upstash Redis:', error);
    throw error;
  }
};

export { redisClient, connectRedis };
