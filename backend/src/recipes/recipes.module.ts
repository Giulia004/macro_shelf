import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { RecipesController } from "./recipes.controller.js";
import { RecipesService } from "./recipes.service.js";

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [RecipesController],
    providers: [RecipesService],
    exports: [RecipesService]
})

export class RecipesModule { }