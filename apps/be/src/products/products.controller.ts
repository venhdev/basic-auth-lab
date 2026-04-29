import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /** GET /products — Any authenticated user can view products */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.productRepository.find();
  }

  /** POST /products — Admin only: create product */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body()
    createProductDto: {
      name: string;
      price: number;
      description?: string;
    },
  ) {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }
}
