import { inject, Injectable } from "@angular/core";
import { DatabaseService, PantryItemRecord } from "./database.service";
import { Product } from "./product.service";

export type PantryItem = PantryItemRecord;

@Injectable({
    providedIn: 'root'
})

export class PantryService {
    private databaseService = inject(DatabaseService);

    async getItems(): Promise<PantryItem[]> {
        return this.databaseService.getPantryItems();
    }

    async addItem(
        product: Product,
        quantity: number,
        expiryDate: string = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        minThreshold = 1,
        unit = product.unit || 'g',
    ): Promise<void> {
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new RangeError('La quantità da aggiungere deve essere un numero positivo.');
        }

        const prod = await this.databaseService.getItemByProductId(product.id);
        if (prod) await this.databaseService.adjustQuantity(prod.id, quantity);
        else {
            await this.databaseService.addPantryItem({
                id: 'pantry_' + Date.now(),
                productId: product.id,
                name: product.name,
                brand: product.brand ?? undefined,
                barcode: product.barcode ?? undefined,
                imageUrl: product.imageUrl ?? undefined,
                quantity,
                expiryDate,
                minThreshold,
                calories: product.calories,
                proteins: product.proteins,
                carbs: product.carbs,
                fats: product.fats,
                fiber: product.fiber ?? undefined,
                sugar: product.sugar ?? undefined,
                saturatedFat: product.saturatedFat ?? undefined,
                salt: product.salt ?? undefined,
                unit,
                category: product.category
            });
        }
    }

    async updateQuantity(id: string, quantity: number): Promise<void> {
        await this.databaseService.updateQuantity(id, quantity);
    }

    async removeItem(id: string): Promise<void> {
        await this.databaseService.removeItem(id);
    }
}