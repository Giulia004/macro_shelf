import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { firstValueFrom, Observable } from "rxjs";
import { DatabaseService } from "./database.service";

export interface Product {
    id: string;
    name: string;
    barcode: string | null;
    brand: string | null;
    imageUrl?: string | null;
    unit: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number | null;
    sugar?: number | null;
    saturatedFat?: number | null;
    salt?: number | null;
    nutritionBaseValue?: number;
    nutritionBaseUnit?: string;
    isCustom?: boolean;
    userId?: string | null;
    dataSource?: string | null;
    isVerified?: boolean;
    category: string | null;
}

export type ProductCategory =
    | 'frutta-verdura'
    | 'carne-pesce'
    | 'latticini'
    | 'dispensa'
    | 'bevande'
    | 'altro';

export interface CreateProductPayload {
    name: string;
    barcode?: string;
    brand?: string;
    imageUrl?: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    saturatedFat?: number;
    salt?: number;
    nutritionBaseValue?: number;
    nutritionBaseUnit?: string;
    dataSource?: string;
    category: ProductCategory;
}

@Injectable({
    providedIn: 'root'
})

export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/products`;
    private databaseService = inject(DatabaseService);

    getProducts(search?: string): Observable<Product[]> {
        let params = new HttpParams();
        if (search)
            params = params.set('search', search.trim());
        return this.http.get<Product[]>(this.apiUrl, { params });
    }

    addProduct(product: CreateProductPayload): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    async findByBarcode(barcode: string): Promise<{ product: Product | null; source: 'catalog' | 'cache' | 'openfoodfacts' | 'none'; }> {
        const code = barcode.trim();
        if (!/^\d{8,14}$/.test(code)) {
            throw new Error('Il barcode deve contenere da 8 a 14 cifre.');
        }

        //Catalogo remoto
        try {
            const products = await firstValueFrom(this.getProducts(code));
            const match = products.find(p => p.barcode === barcode);

            if (match) {
                await this.databaseService.cacheProduct({
                    ...match,
                    id: match.id,
                    barcode: match.barcode,
                    calories: match.calories ?? 0,
                    proteins: match.proteins ?? 0,
                    carbs: match.carbs ?? 0,
                    fats: match.fats ?? 0
                });

                return { product: match, source: 'catalog' };
            }
        } catch (error) {
            console.warn("Catalogo remoto non disponibile", error);
        }

        //Cache locale, utile anche offline
        const cached = await this.databaseService.getCachedProductByBarcode(code);

        if (cached) {
            return {
                product: {
                    id: cached.id,
                    name: cached.name,
                    barcode: cached.barcode,
                    brand: cached.brand,
                    imageUrl: cached.imageUrl,
                    unit: cached.unit ?? 'g',
                    calories: Number(cached.calories ?? 0),
                    proteins: Number(cached.proteins ?? 0),
                    carbs: Number(cached.carbs ?? 0),
                    fats: Number(cached.fats ?? 0),
                    fiber: cached.fiber == null ? null : Number(cached.fiber),
                    sugar: cached.sugar == null ? null : Number(cached.sugar),
                    saturatedFat: cached.saturatedFat == null
                        ? null : Number(cached.saturatedFat),
                    salt: cached.salt == null ? null : Number(cached.salt),
                    category: 'altro',
                    dataSource: 'cache',
                    isVerified: false
                },
                source: 'cache'
            };
        }

        //Altrimenti ricerca online. Se fallisce, l'inserimento manuale resta possibile
        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/api/v3/product/${encodeURIComponent(code)}?fields=code,product_name,brands,image_front_url,categories,nutriments`,
                {
                    headers: { 'User-Agent': 'MacroShelf/1.0' },
                    signal: AbortSignal.timeout(8000)
                }
            );

            if (!response.ok) {
                return { product: null, source: 'none' };
            }

            const data = await response.json();
            const external = data?.product;

            if (data?.status !== 'success' || !external?.product_name?.trim()) {
                return { product: null, source: 'none' };
            }

            const n = external.nutriments ?? {};
            const num = (value: unknown): number =>
                value == null || value === '' || !Number.isFinite(Number(value))
                    ? 0
                    : Math.max(0, Number(value));

            const product: Product = {
                // È un identificativo provvisorio: il backend assegnerà
                // l'ID definitivo quando l'utente conferma l'importazione.
                id: `import_${code}`,
                name: external.product_name.trim(),
                barcode: external.code ?? code,
                brand: external.brands?.split(',')[0]?.trim() || null,
                imageUrl: external.image_front_url ?? null,
                unit: 'g',
                calories: num(n['energy-kcal_100g']),
                proteins: num(n['proteins_100g']),
                carbs: num(n['carbohydrates_100g']),
                fats: num(n['fat_100g']),
                fiber: n['fiber_100g'] == null ? null : num(n['fiber_100g']),
                sugar: n['sugars_100g'] == null ? null : num(n['sugars_100g']),
                saturatedFat: n['saturated-fat_100g'] == null
                    ? null : num(n['saturated-fat_100g']),
                salt: n['salt_100g'] == null ? null : num(n['salt_100g']),
                nutritionBaseValue: 100,
                nutritionBaseUnit: 'g',
                category: 'altro',
                dataSource: 'openfoodfacts',
                isVerified: false
            };

            return { product, source: 'openfoodfacts' };
        } catch (error) {
            console.warn('Ricerca online non riuscita:', error);
            return { product: null, source: 'none' };
        }
    }
}