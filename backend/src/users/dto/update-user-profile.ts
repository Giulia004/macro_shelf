import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

//Interfaccia per la modifica del profilo utente
export class UpdateUserProfileDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: "Il nome non può essere vuoto" })
    @MaxLength(80, { message: "Il nome non può superare 80 caratteri" })
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: "Il cognome non può essere vuoto" })
    @MaxLength(80, { message: "Il cognome non può superare 80 caratteri" })
    surname?: string;
}