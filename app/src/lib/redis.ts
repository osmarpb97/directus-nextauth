import Redis from 'ioredis';
import Redlock from "redlock";

export const redis = new Redis(process.env.REDIS_URL);
    
export const redlock = new Redlock([redis], {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200, 
    retryJitter: 200, 
    automaticExtensionThreshold: 500
});

