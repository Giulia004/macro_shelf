import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ProductsService } from "./products.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ProductResponse } from "./interfaces/product-response.interface.js";
import { CreateProductDto } from "./dto/create-product.dto.js";

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Get()
    findAll(@Query('search') search?: string): Promise<ProductResponse[]> {
        return this.productsService.findAll(search);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ProductResponse> {
        return this.productsService.findOne(id);
    }
    
    @Post()
    create(@Body() body: CreateProductDto): Promise<ProductResponse> {
        return this.productsService.create(body);
    }
}