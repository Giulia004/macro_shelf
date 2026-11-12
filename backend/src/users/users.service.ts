import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { Repository } from "typeorm";
import { UpdateNutritionGoalsDto } from "./dto/update-nutrition-goals.dto.js";

export type Gender = 'MALE' | 'FEMALE';
export interface UserResponse {
    id: string;
    email: string;
    name: string | null;
    surname: string | null;
    age: number | null;
    gender: Gender;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    //Helper per rimuovere la password ed evitare di esporre dati sensibili
    private sanitizeUser(user: any) {
        if (!user) return null;
        const { passwordHash, ...result } = user;

        return {
            ...result,
            createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
            updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
        };
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.userRepository.create(userData);
        return await this.userRepository.save(newUser);
    }
    async findById(userId: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user)
            throw new NotFoundException("Utente non trovato");

        return this.sanitizeUser(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                passwordHash: true,
                isPremium: true,
                createdAt: true,
                updatedAt: true,
                calories: true,
                proteins: true,
                carbs: true,
                fats:true
            },
        });
    }

    async getProfile(userId: number): Promise<UserResponse> {
        return await this.findById(userId);
    }

    async updateProfile(userId: number, name: string, surname: string): Promise<Pick<UserResponse, "name" | "surname">> {
        const normalizedName = name?.trim();
        const normalizedSurname = surname?.trim();

        if (!normalizedName || !normalizedSurname)
            throw new BadRequestException("Nome e cognome sono obbligatori");
        if (normalizedName.length > 80 || normalizedSurname.length > 80)
            throw new BadRequestException("Nome e cognome non possono superare 80 caratteri");

        await this.userRepository.update(userId, {
            name: normalizedName,
            surname: normalizedSurname
        });

        return {
            name: normalizedName,
            surname: normalizedSurname
        };
    }

    //Recupero dei target nutrizionali dell'utente
    async getNutritionGoals(userId: number) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException("Utente non trovato");
        }

        return {
            calories: user.calories,
            proteins: user.proteins,
            carbs: user.carbs,
            fats: user.fats
        };
    }

    //Aggiornamento dei target nutrizionali modificati dall'utente
    async updateNutritionGoals(userId: number, dto: UpdateNutritionGoalsDto) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException("Utente non trovato");
        }

        user.calories = dto.calories;
        user.proteins = dto.proteins;
        user.carbs = dto.carbs;
        user.fats = dto.fats;

        await this.userRepository.save(user);

        return {
            message: 'Obiettivi nutrizionali aggiornati con successo',
            calories: user.calories,
            proteins: user.proteins,
            carbs: user.carbs,
            fats: user.fats,
        };
    }
}