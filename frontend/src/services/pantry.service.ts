import { inject, Injectable } from "@angular/core";
import { DatabaseService, PantryItemRecord } from "./database.service";
import { Product } from "./product.service";

export type PantryItem = PantryItemRecord;

// Funzione di supporto sicura per generare UUID ovunque (compatibile con WebView Android)
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

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

        const barcode = product.barcode?.trim();
        if (barcode && product.id) {
            await this.databaseService.cacheProduct({ ...product, barcode });
        }

        const productIdStr = String(product.id);

        // Controllo esistenza prima per barcode (se presente) e poi per ID prodotto
        let prod = barcode ? await this.databaseService.getItemByBarcode(barcode) : null;
        if (!prod) {
            prod = await this.databaseService.getItemByProductId(productIdStr);
        }

        if (prod) {
            // Se esiste già nella dispensa, aggiorniamo la quantità sommando il delta
            await this.databaseService.adjustQuantity(prod.id, quantity);
        } else {
            // Altrimenti creiamo un nuovo record con UUID sicuro
            await this.databaseService.addPantryItem({
                id: generateUUID(),
                productId: productIdStr,
                name: product.name,
                brand: product.brand ?? undefined,
                barcode: barcode || undefined,
                imageUrl: product.imageUrl ?? undefined,
                quantity,
                expiryDate,
                minThreshold,
                calories: product.calories ?? 0,
                proteins: product.proteins ?? 0,
                carbs: product.carbs ?? 0,
                fats: product.fats ?? 0,
                fiber: product.fiber ?? undefined,
                sugar: product.sugar ?? undefined,
                saturatedFat: product.saturatedFat ?? undefined,
                salt: product.salt ?? undefined,
                unit,
                category: product.category ?? 'dispensa'
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