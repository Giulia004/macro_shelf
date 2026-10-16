import {
    IsString,
    IsOptional,
    IsNumber,
    Min,
    IsUrl,
    IsIn,
    IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty({ message: "Il nome del prodotto è obbligatorio" })
    name: string;

    @IsString()
    @IsOptional()
    barcode?: string;

    @IsString()
    @IsOptional()
    brand?: string;

    @IsUrl({}, { message: "Formato URL immagine non valido" })
    @IsOptional()
    imageUrl?: string;

    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "Le calorie devono essere un numero" })
    @Min(0)
    calories: number;

    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "Le proteine devono essere un numero" })
    @Min(0)
    proteins: number;

    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "I carboidrati devono essere un numero" })
    @Min(0)
    carbs: number;

    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: "I grassi devono essere un numero" })
    @Min(0)
    fats: number;

    // Nuovi macro accessori opzionali
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Min(0)
    @IsOptional()
    fiber?: number;

    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Min(0)
    @IsOptional()
    sugar?: number;

    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Min(0)
    @IsOptional()
    saturatedFat?: number;

    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Min(0)
    @IsOptional()
    salt?: number;

    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Min(0.001)
    @IsOptional()
    nutritionBaseValue?: number;

    @IsString()
    @IsIn(['g', 'ml'])
    @IsOptional()
    nutritionBaseUnit?: string;

    @IsString()
    @IsOptional()
    dataSource?: string;
}