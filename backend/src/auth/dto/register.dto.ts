import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: "Formato email non valido" })
    @IsNotEmpty({ message: "L'email è obbligatoria" })
    email: string;

    @IsString()
    @MinLength(8, { message: "La password deve essere lunga almeno 8 caratteri" })
    password: string;

    @IsString()
    @IsNotEmpty({ message: "Il nome è obbligatorio" })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "Il cognome è obbligatorio" })
    surname: string;
}