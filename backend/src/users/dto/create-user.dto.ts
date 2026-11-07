import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto{
    @IsEmail({}, { message: "Inserisci un'email valida" })
    email: string;

    @IsString()
    @MinLength(8, { message: "La password deve essere lunga almeno 8 caratteri" })
    password: string;

    @IsString()
    name: string;

    @IsString()
    surname: string;
}