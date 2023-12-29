import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // if (!createProductDto.slug) {
      //   createProductDto.slug = createProductDto.title
      //   .toLowerCase()
      //   .replaceAll(' ', '_')
      //   .replaceAll('-', '_')
      //   .replaceAll("'", '')
      // } else {
      //   createProductDto.slug = createProductDto.slug
      //   .toLowerCase()
      //   .replaceAll(' ', '_')
      //   .replaceAll('-', '_')
      //   .replaceAll("'", '')
      // }
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
      
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  // TODO: Paginar
  async findAll() {
    return this.productRepository.find()

  }

  async findOne(identifier: string): Promise<Product> {
    let product: Product;

    try {
      product = await this.productRepository.findOne({ where: { id: identifier as any } })
    } catch (error) {
      throw new NotFoundException(`Product with id ${identifier} not found`);
    }
  
    if (!product) {
      throw new NotFoundException(`Product with identifier ${identifier} not found`);
    }
  
    return product;
  }
  

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
