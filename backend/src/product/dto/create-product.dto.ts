import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: 'Il nome del prodotto è obbligatorio' })
    name: string;

    @IsOptional()
    @IsString()
    barcode?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsNumber({}, { message: 'Le calorie devono essere un numero' })
    @Min(0)
    calories: number;

    @IsNumber({}, { message: 'Le proteine devono essere un numero' })
    @Min(0)
    proteins: number; // Allineato al tuo schema Prisma

    @IsNumber({}, { message: 'I carboidrati devono essere un numero' })
    @Min(0)
    carbs: number;

    @IsNumber({}, { message: 'I grassi devono essere un numero' })
    @Min(0)
    fats: number;

    @IsOptional()
    @IsString()
    unit?: string; // Es. "g", "ml", ecc.
}