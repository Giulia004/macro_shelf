export interface ProductResponse {
    id: string;
    barcode: string | null;
    name: string;
    brand: string | null;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    unit: string;
    createdAt: Date;
}