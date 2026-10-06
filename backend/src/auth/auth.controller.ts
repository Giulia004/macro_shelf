import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";

@Controller('auth')
export class AuthController{
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body:RegisterDto) {
        return this.authService.register(body);
    }
    
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }
}