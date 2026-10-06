import { Module } from "@nestjs/common";
import { JwtModule} from "@nestjs/jwt";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { JwtStrategy } from "./strategies/jwt.strategy.js";

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '7d' }
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports:[JwtModule,AuthService]
})

export class AuthModule { }