import { Injectable, NotFoundException } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from "../prisma/prisma.service.js";
import { ProductResponse } from "./interfaces/product-response.interface.js";
import { CreateProductDto } from "./dto/create-product.dto.js";

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(search?: string): Promise<ProductResponse[]> {
        const products = await this.prisma.product.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search } },
                    { brand: { contains: search } },
                    { barcode: { contains: search } },
                ],
            } : undefined,
            orderBy: { name: 'asc' }
        });

        return products as ProductResponse[];
    }

    //Cerco il prodotto per il suo id
    async findOne(id: string): Promise<ProductResponse> {
        const product = await this.prisma.product.findUnique({
            where: { id }
        });

        if (!product)
            throw new NotFoundException("Prodotto non trovato nel catalogo");

        return product as ProductResponse;
    }

    // Aggiunge un nuovo prodotto al catalogo globale
    async create(dto: CreateProductDto): Promise<ProductResponse> {
        const newProduct = await this.prisma.product.create({
            data: {
                id: uuidv4(), // Genera l'UUID se non gestito nativamente dal DB
                name: dto.name,
                barcode: dto.barcode || null,
                brand: dto.brand || null,
                calories: dto.calories,
                proteins: dto.proteins,
                carbs: dto.carbs,
                fats: dto.fats,
                unit: dto.unit || 'g',
            },
        });

        return newProduct as ProductResponse;
    }

    /*async findByBarcode(barcode: string) {
        return this.prisma.product.findUnique({
            where: { barcode }
        });
    }*/
}