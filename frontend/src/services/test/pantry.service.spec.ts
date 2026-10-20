import { TestBed } from '@angular/core/testing';
import { DatabaseService } from '../database.service';
import { PantryService } from '../pantry.service';
import { Product } from '../product.service';

describe('PantryService', () => {
    let service: PantryService;
    let databaseService: {
        getItemByProductId: ReturnType<typeof vi.fn>;
        adjustQuantity: ReturnType<typeof vi.fn>;
        addPantryItem: ReturnType<typeof vi.fn>;
    };

    const product: Product = {
        id: 'product-1',
        name: 'Pasta',
        barcode: null,
        brand: null,
        unit: 'g',
        calories: 350,
        proteins: 12,
        carbs: 70,
        fats: 2,
        category: 'dispensa',
    };

    beforeEach(() => {
        databaseService = {
            getItemByProductId: vi.fn(),
            adjustQuantity: vi.fn().mockResolvedValue(undefined),
            addPantryItem: vi.fn().mockResolvedValue(undefined),
        };

        TestBed.configureTestingModule({
            providers: [
                PantryService,
                { provide: DatabaseService, useValue: databaseService },
            ],
        });
        service = TestBed.inject(PantryService);
    });

    it('increments an existing product by the requested quantity', async () => {
        databaseService.getItemByProductId.mockResolvedValue({ id: 'pantry-1' });

        await service.addItem(product, 2.5);

        expect(databaseService.adjustQuantity).toHaveBeenCalledWith('pantry-1', 2.5);
        expect(databaseService.addPantryItem).not.toHaveBeenCalled();
    });

    it('stores the product category when adding a new pantry item', async () => {
        databaseService.getItemByProductId.mockResolvedValue(null);

        await service.addItem(product, 2);

        expect(databaseService.addPantryItem).toHaveBeenCalledWith(
            expect.objectContaining({
                productId: product.id,
                quantity: 2,
                category: product.category,
            }),
        );
    });

    it('rejects non-positive quantities', async () => {
        await expect(service.addItem(product, 0)).rejects.toThrow(RangeError);
        expect(databaseService.getItemByProductId).not.toHaveBeenCalled();
    });
});
