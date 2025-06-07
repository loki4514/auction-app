// redis.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: () => {
                return new Redis({
                    host: 'localhost', // your redis host
                    port: 6379,        // default redis port
                    // password: 'your_redis_password', // if auth needed
                });
            },
        },
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
