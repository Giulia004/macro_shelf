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
    fiber: number | null;
    sugar: number | null;
    saturatedFat: number | null;
    salt: number | null;
    nutritionBaseValue: number;
    nutritionBaseUnit: string;
    category: string | null;
    dataSource: string | null;
    isCustom: boolean;
    userId: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedProductsResponse {
    data: ProductResponse[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    };
}