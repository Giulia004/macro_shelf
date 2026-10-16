import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
            throw new Error('JWT_SECRET non è definita nelle variabili d\'ambiente');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: JwtPayload): Promise<JwtPayload> {
        if (!payload?.sub) {
            throw new UnauthorizedException("Token non valido");
        }
        return { sub: payload.sub, email: payload.email };
    }
}