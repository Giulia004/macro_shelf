import { Type } from "class-transformer";
import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Min,
    ValidateNested,
} from "class-validator";
import { CreateRecipeIngredientDto } from "./create-recipe-ingredients-dto.js";

export class CreateRecipeDto {
    @IsString({ message: "Il titolo deve essere un testo" })
    @IsNotEmpty({ message: "Il titolo della ricetta è obbligatorio" })
    title: string;

    @IsOptional()
    @IsString({ message: "La descrizione deve essere un testo" })
    description?: string;

    @IsOptional()
    @IsUrl({}, { message: "L'URL dell'immagine deve essere un indirizzo valido" })
    imageUrl?: string;

    @IsOptional()
    @IsInt({ message: "I minuti di preparazione devono essere un numero intero" })
    @Min(0, { message: "I minuti di preparazione non possono essere negativi" })
    prepTimeMinutes?: number = 0;

    @IsOptional()
    @IsInt({ message: "I minuti di cottura devono essere un numero intero" })
    @Min(0, { message: "I minuti di cottura non possono essere negativi" })
    cookTimeMinutes?: number = 0;

    @IsOptional()
    @IsString({ message: "La difficoltà deve essere una stringa" })
    difficulty?: string = "EASY";

    @IsOptional()
    @IsInt({ message: "Il numero di porzioni deve essere un numero intero" })
    @Min(1, { message: "Il numero di porzioni deve essere almeno 1" })
    servings?: number = 2;

    @IsString({ message: "Le istruzioni devono essere un testo" })
    @IsNotEmpty({ message: "Le istruzioni sono obbligatorie" })
    instructions: string;

    @IsOptional()
    @IsBoolean({ message: "published deve essere un booleano" })
    published?: boolean = true;

    @IsArray({ message: "Gli ingredienti devono essere formattati come lista" })
    @ArrayMinSize(1, { message: "La ricetta deve contenere almeno un ingrediente" })
    @ValidateNested({ each: true })
    @Type(() => CreateRecipeIngredientDto)
    ingredients: CreateRecipeIngredientDto[];
}