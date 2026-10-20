import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

export type RecipeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface RecipeIngredient {
    id: string;
    productId: string;
    productName: string;
    brand: string | null;
    quantity: number;
    unit: string;
    isOptional: boolean;
    notes: string | null;
}

export interface RecipeNutrition {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}

export interface Recipe {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    difficulty: RecipeDifficulty;
    servings: number;
    instructions: string;
    published: boolean;
    ingredients: RecipeIngredient[];
    nutritionPerServing: RecipeNutrition;
    createdAt: string;
    updatedAt: string;
}

export interface MissingIngredient {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    isOptional: boolean;
}

export interface RecipeMatch {
    recipe: Recipe;
    matchPercentage: number;
    missingIngredients: MissingIngredient[];
}

@Injectable({
    providedIn: 'root'
})
export class RecipeService {
    private readonly apiUrl = `${environment.apiUrl}/recipes`;

    constructor(private http: HttpClient) { }

    getRecipes(search?: string): Observable<Recipe[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search.trim());
        }
        return this.http.get<Recipe[]>(this.apiUrl, { params });
    }

    getRecipe(idOrSlug: string): Observable<Recipe> {
        return this.http.get<Recipe>(`${this.apiUrl}/${encodeURIComponent(idOrSlug)}`);
    }

    matchByPantry(pantryProductsIds: string[]): Observable<RecipeMatch[]> {
        return this.http.post<RecipeMatch[]>(`${this.apiUrl}/match`, { pantryProductsIds });
    }
}