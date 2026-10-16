import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ProductResponse } from "./interfaces/product-response.interface.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import type { AuthRequest } from "../auth/interfaces/auth-request.interface.js";

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Get()
    findAll(@Req() req: AuthRequest, @Query('search') search?: string): Promise<ProductResponse[]> {
        const userId = req.user?.sub;
        return this.productsService.findAll(search,userId);
    }

    //Endpoint per il codice a barre
    @Get('barcode/:barcode')
    resolveByBarcode(@Param('barcode') barcode: string): Promise<ProductResponse> {
        return this.productsService.resolveByBarcode(barcode);
    }
    
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ProductResponse> {
        return this.productsService.findOne(id);
    }

    @Post()
    create(@Req() req: AuthRequest, @Body() body: CreateProductDto): Promise<ProductResponse> {
        const userId = req.user?.sub;
        return this.productsService.create(body,userId);
    }

}