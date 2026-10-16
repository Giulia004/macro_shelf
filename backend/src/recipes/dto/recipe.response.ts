export interface RecipeIngredientResponse {
    id: string;
    productId: string;
    productName: string;
    brand: string | null;
    quantity: number;
    unit: string;
    isOptional: boolean;
    notes: string | null;
}

export interface RecipeNutritionResponse {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
}

export interface RecipeResponse {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    difficulty: string;
    servings: number;
    instructions: string;
    published: boolean;
    ingredients: RecipeIngredientResponse[];
    nutritionPerServing: RecipeNutritionResponse;
    createdAt: string;
    updatedAt: string;
}

export interface MissingIngredientResponse {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    isOptional: boolean;
}

export interface RecipeMatchResponse {
    recipe: RecipeResponse;
    matchPercentage: number;
    missingIngredients: MissingIngredientResponse[];
}