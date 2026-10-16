import { BadRequestException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { RecipeMatchResponse, RecipeResponse } from "./dto/recipe.response.js";
import { CreateRecipeDto } from "./dto/create-recipe-dto.js";
import { MatchRecipeDto } from "./dto/match-recipes.dto.js";

@Injectable()
export class RecipesService {
    private readonly logger = new Logger();

    constructor(private prisma: PrismaService) { }

    //Helper per generare uno slugger friendly
    private slugify(text: string): string {
        return text.toLowerCase().trim().replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    private toRecipeResponse(recipe: any): RecipeResponse {
        // Calcolo automatico dei valori nutrizionali totali per singola porzione
        let totalCalories = 0;
        let totalProteins = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        const ingredients = (recipe.ingredients ?? []).map((ing: any) => {
            const product = ing.product;
            if (product) {
                const ratio = ing.quantity / (product.nutritionBaseValue || 100);
                totalCalories += product.calories * ratio;
                totalProteins += product.proteins * ratio;
                totalCarbs += product.carbs * ratio;
                totalFats += product.fats * ratio;
            }

            return {
                id: ing.id,
                productId: ing.productId,
                productName: product?.name ?? "Ingrediente sconosciuto",
                brand: product?.brand ?? null,
                quantity: ing.quantity,
                unit: ing.unit,
                isOptional: ing.isOptional,
                notes: ing.notes ?? null,
            };
        });

        const servings = recipe.servings > 0 ? recipe.servings : 1;

        return {
            id: recipe.id,
            slug: recipe.slug,
            title: recipe.title,
            description: recipe.description ?? null,
            imageUrl: recipe.imageUrl ?? null,
            prepTimeMinutes: recipe.prepTimeMinutes,
            cookTimeMinutes: recipe.cookTimeMinutes,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            instructions: recipe.instructions,
            published: recipe.published,
            ingredients,
            // Nutrizione calcolata per porzione
            nutritionPerServing: {
                calories: Math.round((totalCalories / servings) * 10) / 10,
                proteins: Math.round((totalProteins / servings) * 10) / 10,
                carbs: Math.round((totalCarbs / servings) * 10) / 10,
                fats: Math.round((totalFats / servings) * 10) / 10,
            },
            createdAt: new Date(recipe.createdAt).toISOString(),
            updatedAt: new Date(recipe.updatedAt).toISOString(),
        };
    }

    async findAll(search?: string): Promise<RecipeResponse[]> {
        const recipes = this.prisma.recipe.findMany({
            where: {
                published: true,
                ...(search?.trim() ? {
                    OR: [
                        {
                            title: { contains: search }
                        },
                        { description: { contains: search } }
                    ]
                }
                    : {}),
            },
            include: {
                ingredients: {
                    include: { product: true }
                }
            },
            orderBy: { title: 'asc' }
        });

        return (await recipes).map((r) => this.toRecipeResponse(r));
    }

    async findOne(idOrSlug: string): Promise<RecipeResponse> {
        const recipe = await this.prisma.recipe.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }]
            },
            include: {
                ingredients: {
                    include: { product: true }
                }
            }
        });

        if (!recipe)
            throw new NotFoundException("Ricetta non trovata nel catalogo");

        return this.toRecipeResponse(recipe);
    }

    async create(dto: CreateRecipeDto,userId:string): Promise<RecipeResponse> {
        if (!dto.ingredients || dto.ingredients.length === 0) {
            throw new UnprocessableEntityException("Una ricetta deve contenere almeno un ingrediente");
        }

        const productIds = dto.ingredients.map((i) => i.productId);
        const existingProductsCount = await this.prisma.product.count({
            where: { id: { in: productIds } },
        });

        if (existingProductsCount !== new Set(productIds).size) {
            throw new BadRequestException("Uno o più prodotti specificati tra gli ingredienti non esistono");
        }

        let slug = this.slugify(dto.title);
        const existingSlug = await this.prisma.recipe.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        const recipe = await this.prisma.recipe.create({
            data: {
                slug,
                userId:userId||null,
                title: dto.title.trim(),
                description: dto.description?.trim() || null,
                imageUrl: dto.imageUrl || null,
                prepTimeMinutes: dto.prepTimeMinutes ?? 0,
                cookTimeMinutes: dto.cookTimeMinutes ?? 0,
                difficulty: dto.difficulty || "EASY",
                servings: dto.servings ?? 2,
                instructions: dto.instructions.trim(),
                published: dto.published ?? true,
                ingredients: {
                    create: dto.ingredients.map((ing:any) => ({
                        productId: ing.productId,
                        quantity: ing.quantity,
                        unit: ing.unit || "g",
                        isOptional: ing.isOptional ?? false,
                        notes: ing.notes?.trim() || null,
                    })),
                },
            },
            include: {
                ingredients: {
                    include: { product: true },
                },
            },
        });

        return this.toRecipeResponse(recipe);
    }

    async matchByPantryProducts(pantryProductIds: string[]): Promise<RecipeMatchResponse[]> {
        if (!pantryProductIds || pantryProductIds.length === 0) {
            return [];
        }

        const recipes = await this.prisma.recipe.findMany({
            where: { published: true },
            include: {
                ingredients: {
                    include: { product: true },
                },
            },
        });

        const matches: RecipeMatchResponse[] = [];

        for (const recipe of recipes) {
            const mandatoryIngredients = recipe.ingredients.filter((i) => !i.isOptional);
            if (mandatoryIngredients.length === 0) continue;

            const availableMandatory = mandatoryIngredients.filter((i) =>
                pantryProductIds.includes(i.productId),
            );

            const matchPercentage = Math.round(
                (availableMandatory.length / mandatoryIngredients.length) * 100,
            );

            if (matchPercentage >= 30) {
                const missingIngredients = recipe.ingredients
                    .filter((i) => !pantryProductIds.includes(i.productId))
                    .map((i) => ({
                        productId: i.productId,
                        productName: i.product?.name ?? "Ingrediente sconosciuto",
                        quantity: i.quantity,
                        unit: i.unit,
                        isOptional: i.isOptional,
                    }));

                matches.push({
                    recipe: this.toRecipeResponse(recipe),
                    matchPercentage,
                    missingIngredients,
                });
            }
        }

        return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }
}