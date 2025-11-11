/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const allowOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    app.enableCors({
        origin: allowOrigins.length === 1 ? allowOrigins[0] : allowOrigins,
        credentials: false,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.connectMicroservice({
        transport: Transport.TCP,
        options: { port: 4001 }
    });

    await app.startAllMicroservices();
    await app.listen(3030);
}

bootstrap();
