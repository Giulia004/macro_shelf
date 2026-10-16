import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: "Formato email non valido" })
    @IsNotEmpty({ message: "L'email è obbligatoria" })
    email: string;

    @IsString()
    @IsNotEmpty({ message: "La password è obbligatoria" })
    password: string;
}