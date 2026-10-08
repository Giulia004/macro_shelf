import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { Observable } from "rxjs";

export interface Product{
    id: string;
    name: string;
    barcode: string | null;
    brand: string | null;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    unit: string;
}

@Injectable({
    providedIn:'root'
})

export class ProductService{
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/products`;

    getProducts(search?: string): Observable<Product[]>{
        let params = new HttpParams();
        if (search)
            params = params.set('search', search);
        return this.http.get<Product[]>(this.apiUrl, { params });
    }
}