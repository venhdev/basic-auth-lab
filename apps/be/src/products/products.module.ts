import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    UsersModule, // Thêm dòng này để RolesGuard có thể dùng UsersService
  ],
  controllers: [ProductsController],
})
export class ProductsModule {}
