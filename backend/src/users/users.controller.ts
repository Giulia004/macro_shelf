import { Body, Controller, Get, Patch, Put, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import type {  UserResponse } from "./users.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import type { AuthRequest } from "../auth/interfaces/auth-request.interface.js";
import { UpdateNutritionGoalsDto } from "./dto/update-nutrition-goals.dto.js";

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

    @UseGuards(JwtAuthGuard)
    @Get('nutrition-goals')
    getGoals(@Req() req:AuthRequest) {
        const userId = req.user?.sub;
        return this.usersService.getNutritionGoals(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('nutrition-goals')
    updateGoals(@Req() req: AuthRequest, @Body() dto: UpdateNutritionGoalsDto) {
        const userId = req.user?.sub;
        return this.usersService.updateNutritionGoals(userId, dto);
    }
}