import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from "class-validator";

export class CreateRecipeIngredientDto {
    @IsUUID("4", { message: "Il productId deve essere un UUID v4 valido" })
    @IsNotEmpty({ message: "Il productId dell'ingrediente è obbligatorio" })
    productId: string;

    @IsNumber({}, { message: "La quantità deve essere un numero valido" })
    @Min(0.1, { message: "La quantità deve essere maggiore di zero" })
    quantity: number;

    @IsOptional()
    @IsString({ message: "L'unità di misura deve essere una stringa" })
    unit?: string = "g";

    @IsOptional()
    @IsBoolean({ message: "isOptional deve essere un booleano" })
    isOptional?: boolean = false;

    @IsOptional()
    @IsString({ message: "Le note devono essere un testo" })
    notes?: string;
}