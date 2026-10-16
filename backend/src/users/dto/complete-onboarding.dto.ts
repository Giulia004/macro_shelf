import { ActivityLevel, Gender, Goal } from "@prisma/client";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, Max, Min } from "class-validator";

export class CompleteOnBoardingDto {
    @IsEnum(Gender, { message: "Il sesso deve essere MALE o FEMALE" })
    @IsNotEmpty({ message: "Il sesso è obbligatorio per il calcolo del fabbisogno giornaliero" })
    gender: Gender;

    @IsInt({ message: "L'età deve essere un numero intero" })
    @Min(12, { message: "Devi avere almeno 12 anni" })
    @Max(120, { message: "Età non valida" })
    age: number;

    @IsNumber({}, { message: "L'altezza viene misurata in cm" })
    @Min(100, { message: "L'altezza minima è 100 cm" })
    @Max(250, { message: "L'altezza massima è 250 cm" })
    height: number;

    @IsNumber({}, { message: "Il peso deve essere in kg" })
    @Min(30, { message: "Il peso minimo è 30 kg" })
    @Max(300, { message: "Il peso massimo è 300 kg" })
    weight: number;

    @IsEnum(ActivityLevel, { message: "Livello di attività non valido" })
    @IsNotEmpty({ message: "Il livello di attività fisica è obbligatorio" })
    activityLevel: ActivityLevel;

    @IsEnum(Goal, { message: "Obiettivo nutrizionale non valido" })
    @IsNotEmpty({ message: "L'obiettivo nutrizionale è obbligatorio" })
    goal: Goal;
}