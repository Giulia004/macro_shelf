import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";

export type PantryCategory = 'frutta-verdura' | 'carne-pesce' | 'latticini' | 'bevande' | 'dispensa' | 'altro';

export interface Product {
    id: number;
    name: string;
    barcode: string;
    unit: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    saturatedFat?: number;
    salt?: number;
    category: string;
    brand?: string;
    imageUrl?: string;
    nutritionBaseValue?: number;
    nutritionBaseUnit?: string;
}

export type BarcodeLookupResult =
    | { product: Product; source: 'catalog' | 'openfoodfacts' }
    | { product: null; source: 'none' };


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
    category: string;
}

@Injectable({
    providedIn: 'root'
})

export class ProductService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/products`;

    getAllProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    addProduct(payload: CreateProductPayload): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, payload);
    }

    findByBarcode(barcode: string): Observable<BarcodeLookupResult> {
        return this.http.get<BarcodeLookupResult>(
            `${this.apiUrl}/barcode/${encodeURIComponent(barcode)}`
        );
    }
}