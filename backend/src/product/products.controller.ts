import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { PaginatedProductsResponse, ProductResponse } from "./dto/product-response.dto.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import type { AuthRequest } from "../auth/interfaces/auth-request.interface.js";
import { UpdateProductDto } from "./dto/update-product.dto.js";

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Post()
    create(@Body() createProductDto: CreateProductDto) {
        return this.productsService.create(createProductDto);
    }

    //Lista di tutti i prodotti presenti nel catalogo
    @Get()
    findAll() {
        return this.productsService.findAll();
    }

    //Recupero del prodotto mediante barcode
    @Get('barcode/:barcode')
    findByBarcode(@Param('barcode') barcode: string) {
        return this.productsService.findByBarcode(barcode);
    }

    //Recupero del prodotto mediante l'id
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id:number) {
        return this.productsService.findOne(id);
    }

    //Aggiornamento di un prodotto
    @Patch(':id')
    update(@Param('int', ParseIntPipe) id: number,@Body() updateProductDto:UpdateProductDto) {
        return this.productsService.update(+id, updateProductDto);
    }

    @Delete('id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}