import { Body, Controller, Get, Patch, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import type { UserResponse } from "./users.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import type { AuthRequest } from "../auth/interfaces/auth-request.interface.js";
import { UpdateGoalDto } from "./dto/update-goal.dto.js";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: AuthRequest): Promise<UserResponse> {
        const userId = req.user?.sub;
        return this.usersService.getProfile(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async updateProfile(@Req() req: any, @Body() body: { name: string, surname: string }) {
        const userId = req.user?.sub;

        if (!userId)
            throw new UnauthorizedException("Utente non autorizzato");

        return this.usersService.updateProfile(userId, body.name, body.surname);
    }

    @Patch('goal')
    async updateGoal(@Req() req: AuthRequest, @Body() update: UpdateGoalDto): Promise<UserResponse> {
        const userId = req.user?.sub;

        return this.usersService.updateGoalAndMacro(userId, update);
    }
}