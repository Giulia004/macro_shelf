import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateGoalDto {
    @IsOptional()
    @IsString()
    @IsIn(['CUTTING', 'MAINTENANCE', 'BULKING'], {
        message: 'L\'obiettivo deve essere CUTTING, MAINTENANCE o BULKING',
    })
    goal?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Il target calorico deve essere un numero' })
    @Min(500, { message: 'Il target calorico minimo è 500 kcal' })
    @Max(8000, { message: 'Il target calorico massimo è 8000 kcal' })
    targetCalories?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Le proteine devono essere un numero' })
    @Min(0, { message: 'Le proteine non possono essere negative' })
    targetProtein?: number;

    @IsOptional()
    @IsNumber({}, { message: 'I carboidrati devono essere un numero' })
    @Min(0, { message: 'I carboidrati non possono essere negativi' })
    targetCarbs?: number;

    @IsOptional()
    @IsNumber({}, { message: 'I grassi devono essere un numero' })
    @Min(0, { message: 'I grassi non possono essere negativi' })
    targetFats?: number;
}