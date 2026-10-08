import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateGoalDto } from "./dto/update-goal.dto.js";

export interface UserResponse {
    id: string;
    email: string;
    name: string | null;
    surname: string | null;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    goal: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    //Recupero del profilo dell'utente tramite il suo id
    async getProfile(userId: string): Promise<UserResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user)
            throw new NotFoundException("Utente non trovato");

        //Rimuovo la password e restituisco l'oggetto pulito
        const { password, ...result } = user;
        return result as UserResponse;
    }

    async updateProfile(id: string, name: string, surname: string) {
        const normalizedName = name?.trim();
        const normalizedSurname = surname?.trim();
        if (!normalizedName || !normalizedSurname)
            throw new BadRequestException("Nome e cognome sono obbligatori");
        if (normalizedName.length > 80 || normalizedSurname.length > 80)
            throw new BadRequestException("Nome e cognome non possono superare 80 caratteri");

        return this.prisma.user.update({
            where: { id },
            data: {
                name: normalizedName,
                surname: normalizedSurname,
                updatedAt: new Date()
            },
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                targetCalories: true,
                targetProtein: true,
                targetCarbs: true,
                targetFats: true,
                goal: true
            }
        });
    }

    async updateGoalAndMacro(userId: string, dto: UpdateGoalDto): Promise<UserResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user)
            throw new NotFoundException("Utente inesistente");

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.goal !== undefined && { goal: dto.goal }),
                ...(dto.targetCalories !== undefined && { targetCalories: dto.targetCalories }),
                ...(dto.targetProtein !== undefined && { targetProtein: dto.targetProtein }),
                ...(dto.targetCarbs !== undefined && { targetCarbs: dto.targetCarbs }),
                ...(dto.targetFats !== undefined && { targetFats: dto.targetFats }),
            },
        });

        const { password, ...result } = updatedUser;
        return result as UserResponse;
    }
}