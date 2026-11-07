import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    barcode: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    brand?: string;

    @IsString()
    @IsOptional()
    @MaxLength(20)
    unit?: string;

    @IsNumber()
    @Min(0)
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

    // --- Nuovi campi opzionali per i dettagli nutrizionali ---
    @IsOptional()
    @IsNumber()
    @Min(0)
    sugar?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    saturatedFat?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    fiber?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    salt?: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    imageUrl?: string;
}