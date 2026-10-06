import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from "./dto/register.dto.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { LoginDto } from "./dto/login.dto.js";

@Injectable()

export class AuthService {
    constructor(private prismaService: PrismaService, private jwtService: JwtService) { }

    async register(register: RegisterDto) {
        //Verifico se l'email esiste già
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: register.email }
        });

        if (existingUser) throw new BadRequestException("Email già associata ad un account");

        const hashedPassword = await bcrypt.hash(register.password, 10);

        //Creazione dell'utente su database con obiettivi standard
        const user = await this.prismaService.user.create({
            data: {
                id: globalThis.crypto.randomUUID(),
                email: register.email,
                password: hashedPassword,
                name: register.name,
                surname: register.surname,
                goal: 'MAINTENANCE',
                targetCalories: 2000,
                targetProtein: 120,
                targetCarbs: 200,
                targetFats: 60,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        //Restituisco l'utente senza la password
        const { password, ...result } = user;
        return result;
    }

    async login(login:LoginDto) {
        if (!login.email || !login.password)
            throw new BadRequestException("Email e password richiesti");

        const user = await this.prismaService.user.findUnique({
            where: { email: login.email }
        });

        if (!user)
            throw new UnauthorizedException("Credenziali non valide");

        //Eseguo il confronto bcrypt
        const isPasswordValid = await bcrypt.compare(login.password, user.password);
        if (!isPasswordValid)
            throw new UnauthorizedException("Password non valida");

        //Generazione del payload JWT
        const payload = { sub: user.id, email: user.email };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                goal:user.goal,
                idPremium:user.isPremium
            }
        };
    }
}