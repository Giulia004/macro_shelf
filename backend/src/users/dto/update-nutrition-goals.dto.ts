import { IsNumber, Min } from "class-validator";

export class UpdateNutritionGoalsDto {
    @IsNumber()
    @Min(1)
    calories: number;

    @IsNumber()
    @Min(0)
    proteins: number;

    @IsNumber()
    @Min(0)
    carbs: number;

    @IsNumber()
    @Min(0)
    fats: number;
}