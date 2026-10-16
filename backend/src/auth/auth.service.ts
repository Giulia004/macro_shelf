import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RegisterDto } from "./dto/register.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { JwtPayload } from "./interfaces/jwt-payload.interface.js";

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService
    ) { }

    async register(register: RegisterDto) {
        const normalizedEmail = register.email.toLowerCase().trim();

        // Verifico se l'email esiste già
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (existingUser) {
            throw new BadRequestException("Email già associata ad un account");
        }

        const hashedPassword = await bcrypt.hash(register.password, 10);

        // Creazione dell'utente su database con i default da schema Prisma
        const user = await this.prismaService.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name: register.name.trim(),
                surname: register.surname.trim(),
            },
        });

        const payload: JwtPayload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                isOnboardingCompleted: user.isOnboardingCompleted,
                isPremium: user.isPremium,
            }
        };
    }

    async login(login: LoginDto) {
        if (!login.email || !login.password) {
            throw new BadRequestException("Email e password richiesti");
        }

        const normalizedEmail = login.email.toLowerCase().trim();

        const user = await this.prismaService.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (!user) {
            throw new UnauthorizedException("Credenziali non valide");
        }

        const isPasswordValid = await bcrypt.compare(login.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Credenziali non valide");
        }

        const payload: JwtPayload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);

        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                isOnboardingCompleted: user.isOnboardingCompleted,
                isPremium: user.isPremium,
            }
        };
    }
}