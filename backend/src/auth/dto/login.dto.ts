import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: "Formato email non valid" })
    email: string;

    @IsString()
    password: string;
}