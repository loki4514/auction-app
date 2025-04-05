// src/infrastructure/database/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        try {
            await this.$connect();
            console.log('Prisma is connected to the database.');
        } catch (error) {
            console.error('Error connecting to the database:', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
