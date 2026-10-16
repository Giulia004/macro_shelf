import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateGoalDto } from "./dto/update-goal.dto.js";
import { CompleteOnBoardingDto } from "./dto/complete-onboarding.dto.js";
import { NutritionCalculator } from "./utils/nutrition-calculator.util.js";
import { ActivityLevel, Gender, Goal } from "@prisma/client";

export interface UserResponse {
    id: string;
    email: string;
    name: string | null;
    surname: string | null;
    gender: Gender | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    activityLevel: ActivityLevel | null;
    goal: Goal | null;
    isOnboardingCompleted: boolean;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    //Esegue l'onBoarding e calcola i fabbisogni minimi
    async completeOnBoarding(userId: string, dto: CompleteOnBoardingDto) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId }
        });
        if (!user)
            throw new NotFoundException("Utente non trovato");

        //Calcolo automatico di BMR, TDEE e target nutrizionali
        const nutrition = NutritionCalculator.calculate(
            dto.gender,
            dto.age,
            dto.height,
            dto.weight,
            dto.activityLevel,
            dto.goal
        );

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                gender: dto.gender,
                age: dto.age,
                height: dto.height,
                weight: dto.weight,
                activityLevel: dto.activityLevel,
                goal: dto.goal,
                isOnboardingCompleted: true,
                targetCalories: nutrition.targetCalories,
                targetProtein: nutrition.targetProtein,
                targetCarbs: nutrition.targetCarbs,
                targetFats: nutrition.targetFats,
            },
        });

        // Registrazione automatica della prima pesata nello storico
        await this.prisma.weightLog.create({
            data: {
                userId,
                weight: dto.weight,
                notes: "Peso iniziale (Onboarding)",
            },
        });

        return {
            message: "Onboarding completato con successo",
            calculatedNutrition: nutrition,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                isOnboardingCompleted: updatedUser.isOnboardingCompleted,
                targetCalories: updatedUser.targetCalories,
                targetProtein: updatedUser.targetProtein,
                targetCarbs: updatedUser.targetCarbs,
                targetFats: updatedUser.targetFats,
            },
        };
    }

    //Recupero del profilo dell'utente tramite il suo id
    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                surname: true,
                gender: true,
                age: true,
                height: true,
                weight: true,
                activityLevel: true,
                goal: true,
                isOnboardingCompleted: true,
                targetCalories: true,
                targetProtein: true,
                targetCarbs: true,
                targetFats: true,
                isPremium: true,
                createdAt: true,
                updatedAt: true
            },
        });
        if (!user)
            throw new NotFoundException("Utente non trovato");
        return user;
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