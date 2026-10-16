export interface ProductResponse {
    id: string;
    barcode: string | null;
    name: string;
    brand: string | null;
    imageUrl: string | null;

    unit: string;

    calories: number;
    proteins: number;
    carbs: number;
    fats: number;

    //Macro accessori opzionali
    fiber?: number | null;
    sugar?: number | null;
    saturatedFat?: number | null;
    salt?: number | null;

    nutritionBaseValue: number;
    nutritionBaseUnit: string;

    isCustom?: boolean;
    userId?: string | null;
    dataSource: string | null;
    isVerified: boolean;

    createdAt: string;
    updatedAt: string;
}