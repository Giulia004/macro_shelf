import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        //Si connette al database all'avvio dell'applicazione
        await this.$connect();
    }

    async onModuleDestroy() {
        //Si disconnette dal database alla chiusura dell'applicazione
        await this.$disconnect();
    }
}