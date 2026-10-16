import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RecipesService } from "./recipes.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RecipeResponse,RecipeMatchResponse } from "./dto/recipe.response.js";
import { MatchRecipeDto } from "./dto/match-recipes.dto.js";
import type { AuthRequest } from "../auth/interfaces/auth-request.interface.js";
import { CreateRecipeDto } from "./dto/create-recipe-dto.js";

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    //Elenco delle ricette per tutti gli utenti autenticati
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Query('search') search?: string): Promise<RecipeResponse[]> {
        return this.recipesService.findAll(search);
    }

    //Consiglio ricette in base a cosa c'è in dispensa
    @UseGuards(JwtAuthGuard)
    @Post('match')
    matchByPantry(@Body() body: MatchRecipeDto): Promise<RecipeMatchResponse[]> {
        return this.recipesService.matchByPantryProducts(body.pantryProductsIds);
    }

    //Dettaglio della singola ricetta tramite ID o per slug (es:/recipes/pasta-al-tonno)
    @UseGuards(JwtAuthGuard)
    @Get(':idOrSlug')
    findOne(@Param('idOrSlug') idOrSlug: string): Promise<RecipeResponse> {
        return this.recipesService.findOne(idOrSlug);
    }

    //Creazione di una nuova ricetta
    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Req() req: AuthRequest, @Body() dto: CreateRecipeDto): Promise<RecipeResponse>{
        const userId = req.user?.sub;
        return this.recipesService.create(dto, userId);
    }
}