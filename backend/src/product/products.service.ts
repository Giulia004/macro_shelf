import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException, UnprocessableEntityException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProductResponse } from "./interfaces/product-response.interface.js";
import { CreateProductDto } from "./dto/create-product.dto.js";

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(private prisma: PrismaService) { }

    private toProductResponse(product: any): ProductResponse {
        return {
            id: product.id,
            barcode: product.barcode,
            name: product.name,
            brand: product.brand,
            imageUrl: product.imageUrl,
            unit: product.unit,
            calories: product.calories,
            proteins: product.proteins,
            carbs: product.carbs,
            fats: product.fats,
            fiber: product.fiber ?? null,
            sugar: product.sugar ?? null,
            saturatedFat: product.saturatedFat ?? null,
            salt: product.salt ?? null,
            nutritionBaseValue: product.nutritionBaseValue,
            nutritionBaseUnit: product.nutritionBaseUnit,
            isCustom: product.isCustom ?? false,
            userId: product.userId ?? null,
            dataSource: product.dataSource,
            isVerified: product.isVerified,
            createdAt: new Date(product.createdAt).toISOString(),
            updatedAt: new Date(product.updatedAt).toISOString(),
        };
    }

    async findAll(search?: string, userId?: string): Promise<ProductResponse[]> {
        const andConditions: any[] = [];

        // Filtro di ricerca per testo
        if (search?.trim()) {
            andConditions.push({
                OR: [
                    { name: { contains: search.trim() } },
                    { brand: { contains: search.trim() } },
                    { barcode: { contains: search.trim() } },
                ],
            });
        }

        // Mostra i prodotti del catalogo pubblico OPPURE quelli creati dall'utente corrente
        if (userId) {
            andConditions.push({
                OR: [
                    { isCustom: false },
                    { userId },
                ],
            });
        } else {
            andConditions.push({ isCustom: false });
        }

        const products = await this.prisma.product.findMany({
            where: { AND: andConditions },
            orderBy: { name: 'asc' },
            take: 40,
        });

        return products.map((product) => this.toProductResponse(product));
    }

    async findOne(id: string): Promise<ProductResponse> {
        const product = await this.prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            throw new NotFoundException("Prodotto non trovato nel catalogo");
        }

        return this.toProductResponse(product);
    }

    async create(dto: CreateProductDto, userId?: string): Promise<ProductResponse> {
        // Se c'è un barcode, verifichiamo che non sia già presente
        if (dto.barcode?.trim()) {
            const existing = await this.prisma.product.findUnique({
                where: { barcode: dto.barcode.trim() }
            });
            if (existing) {
                throw new BadRequestException("Esiste già un prodotto registrato con questo codice a barre");
            }
        }

        const product = await this.prisma.product.create({
            data: {
                name: dto.name.trim(),
                barcode: dto.barcode?.trim() || null,
                brand: dto.brand?.trim() || null,
                imageUrl: dto.imageUrl || null,
                unit: "g",
                calories: dto.calories,
                proteins: dto.proteins,
                carbs: dto.carbs,
                fats: dto.fats,
                fiber: dto.fiber ?? null,
                sugar: dto.sugar ?? null,
                saturatedFat: dto.saturatedFat ?? null,
                salt: dto.salt ?? null,
                nutritionBaseValue: dto.nutritionBaseValue ?? 100,
                nutritionBaseUnit: dto.nutritionBaseUnit ?? "g",
                dataSource: dto.dataSource?.trim() || (userId ? "UserCustom" : "Manual"),
                isCustom: !!userId,
                userId: userId || null,
                isVerified: false,
            },
        });

        return this.toProductResponse(product);
    }

    async resolveByBarcode(barcode: string): Promise<ProductResponse> {
        const normalizeBarcode = barcode.trim();

        if (!normalizeBarcode) {
            throw new UnprocessableEntityException("Il codice a barre non può essere vuoto");
        }

        // 1. Cerchiamo prima nella cache/database locale
        const product = await this.prisma.product.findUnique({
            where: { barcode: normalizeBarcode }
        });

        if (product) {
            return this.toProductResponse(product);
        }

        // 2. Se non presente, interroghiamo Open Food Facts con User-Agent appropriato
        let response: Response;
        try {
            response = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(normalizeBarcode)}.json`,
                {
                    headers: {
                        'User-Agent': 'MacroShelf - MobileApp/1.0 (contact@macroshelf.app)',
                    },
                    signal: AbortSignal.timeout(6000),
                },
            );
        } catch (error) {
            this.logger.warn(
                `Open Food Facts non raggiungibile: ${error instanceof Error ? error.message : "errore sconosciuto"}`,
            );
            throw new ServiceUnavailableException(
                "Il servizio di ricerca prodotti è temporaneamente indisponibile",
            );
        }

        if (!response.ok) {
            this.logger.warn(`Open Food Facts ha risposto con HTTP ${response.status}`);
            throw new ServiceUnavailableException("Errore durante la ricerca del prodotto");
        }

        let data: any;
        try {
            data = await response.json();
        } catch {
            throw new ServiceUnavailableException("Risposta non valida dal servizio prodotti");
        }

        if (data?.status !== 1 || !data.product) {
            throw new NotFoundException("Prodotto non trovato su Open Food Facts");
        }

        const offProduct = data.product;
        const nutriments = offProduct.nutriments ?? {};

        const calories = nutriments["energy-kcal_100g"];
        const proteins = nutriments["proteins_100g"];
        const carbs = nutriments["carbohydrates_100g"];
        const fats = nutriments["fat_100g"];

        const nutritionValues = [calories, proteins, carbs, fats];
        const hasCompleteNutrition = nutritionValues.every(
            (value) => typeof value === "number" && Number.isFinite(value) && value >= 0,
        );

        if (!hasCompleteNutrition) {
            throw new UnprocessableEntityException(
                "Il prodotto è presente, ma i dati nutrizionali di base sono incompleti",
            );
        }

        // Estraiamo anche i macro accessori se disponibili
        const fiber = typeof nutriments["fiber_100g"] === "number" ? nutriments["fiber_100g"] : null;
        const sugar = typeof nutriments["sugars_100g"] === "number" ? nutriments["sugars_100g"] : null;
        const saturatedFat = typeof nutriments["saturated-fat_100g"] === "number" ? nutriments["saturated-fat_100g"] : null;
        const salt = typeof nutriments["salt_100g"] === "number" ? nutriments["salt_100g"] : null;

        const createdProduct = await this.prisma.product.create({
            data: {
                barcode: normalizeBarcode,
                name: offProduct.product_name?.trim() || "Prodotto senza nome",
                brand: offProduct.brands || null,
                imageUrl: offProduct.image_front_url || null,
                unit: "g",
                calories,
                proteins,
                carbs,
                fats,
                fiber,
                sugar,
                saturatedFat,
                salt,
                nutritionBaseValue: 100,
                nutritionBaseUnit: "g",
                dataSource: "OpenFoodFacts",
                isCustom: false,
                isVerified: false,
            },
        });

        return this.toProductResponse(createdProduct);
    }
}