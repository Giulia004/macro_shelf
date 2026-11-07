import { Body, Controller, Get, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import type {  UserResponse } from "./users.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import type { AuthRequest } from "../auth/interfaces/auth-request.interface.js";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: AuthRequest): Promise<UserResponse> {
        const userId = req.user?.sub;
        return await this.usersService.getProfile(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async updateProfile(@Req() req: AuthRequest, @Body('name') name: string, @Body('surname') surname: string) {
        const userId = req.user?.sub;

        if (!userId)
            throw new UnauthorizedException("Utente non autorizzato");

        return this.usersService.updateProfile(userId, name, surname);
    }
}