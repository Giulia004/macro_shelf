import { BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./product.entity.js";
import { UpdateProductDto } from "./dto/update-product.dto.js";

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) { }

    //Aggiunta prodotto al catalogo
    async create(createProductDto: CreateProductDto): Promise<Product> {
        const existing = await this.productRepository.findOne({
            where: { barcode: createProductDto.barcode }
        });

        if (existing)
            throw new BadRequestException("Esiste già questo prodotto");

        const product = await this.productRepository.create(createProductDto);
        return await this.productRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return await this.productRepository.find();
    }

    async findOne(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id }
        });

        if (!product)
            throw new NotFoundException("Prodotto non trovato");

        return product;
    }

    // Ricerca per barcode: restituisce un oggetto strutturato { product, source }
    async findByBarcode(barcode: string): Promise<{ product: Product | null; source: 'catalog' | 'openfoodfacts' | 'none' }> {
        // 1. Cerca nel database locale (catalogo)
        let product = await this.productRepository.findOne({
            where: { barcode }
        });

        if (product) {
            return { product, source: 'catalog' };
        }

        this.logger.log(`Prodotto con barcode ${barcode} non trovato localmente. Interrogo Open Food Facts...`);

        let data: { status?: number; product?: Record<string, any> };
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`, {
                headers: { 'User-Agent': 'MacroShelf/1.0 (dev@macroshelf.local)' },
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) {
                throw new Error(`Open Food Facts ha risposto con HTTP ${response.status}`);
            }

            data = await response.json();
        } catch (error) {
            this.logger.error(`Errore durante la chiamata a Open Food Facts: ${error}`);
            throw new BadGatewayException('Open Food Facts non è al momento raggiungibile');
        }

        if (data.status !== 1 || !data.product) {
            return { product: null, source: 'none' };
        }

        const ext = data.product;
        const nutriments = ext.nutriments || {};

        // Crea il prodotto in modo che sia già disponibile nel catalogo locale per le prossime volte
        const newProduct = this.productRepository.create({
            barcode,
            name: ext.product_name || ext.product_name_it || 'Prodotto sconosciuto',
            brand: ext.brands || null,
            unit: 'g',
            calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
            proteins: nutriments['proteins_100g'] || 0,
            carbs: nutriments['carbohydrates_100g'] || 0,
            fats: nutriments['fat_100g'] || 0,
            sugar: nutriments['sugars_100g'] || null,
            saturatedFat: nutriments['saturated-fat_100g'] || null,
            fiber: nutriments['fiber_100g'] || nutriments['fibers_100g'] || null,
            salt: nutriments['salt_100g'] || null,
            category: ext.categories || 'Generico',
            imageUrl: ext.image_front_url || ext.image_url || null,
        });

        const savedProduct = await this.productRepository.save(newProduct);

        return { product: savedProduct, source: 'openfoodfacts' };
    }
    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return await this.productRepository.save(product);
    }

    async remove(id: number): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepository.remove(product);
    }

}