import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class MatchRecipeDto{
    @IsArray({ message: "pantryProductIds deve essere una lista di ID" })
    @IsNotEmpty({ message: "La lista degli ingredienti non può essere vuota" })
    @IsUUID("4", { each: true, message: "Ogni ID prodotto deve essere un UUID valido" })
    pantryProductsIds: string[];
}