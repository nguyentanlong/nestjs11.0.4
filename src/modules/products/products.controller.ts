// // Import NestJS decorators và guards
// import {
//     Controller,
//     Get,
//     Post,
//     Put,
//     Delete,
//     Body,
//     Param,
//     Req,
//     UseGuards,
// } from '@nestjs/common';
// import { ProductsService } from './products.service';
// import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Guard kiểm tra JWT
// import { RolesGuard } from 'src/common/guards/roles.guard';// Guard kiểm tra role

// // Controller cho module Products
// @UseGuards(JwtAuthGuard, RolesGuard) // Bắt buộc đăng nhập và kiểm tra role
// @Controller('products')
// export class ProductsController {
//     constructor(private readonly productsService: ProductsService) { }

//     // 🟢 API tạo sản phẩm
//     @Post()
//     async create(@Req() req, @Body() dto: CreateProductDto) {
//         return this.productsService.createProduct(req.user, dto);
//     }

//     // 🟡 API cập nhật sản phẩm
//     @Put(':id')
//     async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateProductDto) {
//         return this.productsService.updateProduct(req.user, id, dto);
//     }

//     // 🔴 API xóa sản phẩm
//     @Delete(':id')
//     async delete(@Req() req, @Param('id') id: string) {
//         return this.productsService.deleteProduct(req.user, id);
//     }

//     // 📖 API lấy tất cả sản phẩm
//     @Get()
//     async findAll() {
//         return this.productsService.findAll();
//     }

//     // 📖 API lấy chi tiết sản phẩm
//     @Get(':id')
//     async findOne(@Param('id') id: string) {
//         return this.productsService.findOne(id);
//     }
// }
// Import NestJS decorators và guards
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFiles, // thêm để nhận nhiều file
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';//UpdateProductDto
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Guard kiểm tra JWT
import { RolesGuard } from 'src/common/guards/roles.guard';// Guard kiểm tra role

// 👉 import Multer interceptor và config
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/uploads/multer.config';
import { UpdateProductDtoMoi } from './dto/update-product.dto';


// Controller cho module Products
@UseGuards(JwtAuthGuard, RolesGuard) // Bắt buộc đăng nhập và kiểm tra role
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // 🟢 API tạo sản phẩm (chỉ dữ liệu JSON)
    // @Post()
    // async create(@Req() req, @Body() dto: CreateProductDto) {
    //     return this.productsService.createProduct(req.user, dto);
    // }

    // 🟢 API tạo sản phẩm + upload nhiều file (ảnh/video/tài liệu)
    // @Post('upload')
    // @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
    // // 👉 'files' là tên field trong form-data, 10 là số file tối đa
    // async uploadFiles(
    //     @UploadedFiles() files: Express.Multer.File[], // nhận danh sách file
    //     @Body() dto: CreateProductDto, // nhận dữ liệu sản phẩm
    //     @Req() req,
    // ) {
    //     // Lấy path của file đã upload
    //     const filePaths = files.map((file) => file.path);

    //     // Gán vào media của sản phẩm
    //     dto.media = filePaths;

    //     // Gọi service để lưu sản phẩm
    //     return this.productsService.createProduct(req.user, dto);
    // }
    // API tạo sản phẩm có json và file
    @Post()
    @UseInterceptors(FilesInterceptor('files', 10, multerConfig)) // cho phép upload nhiều file
    async create(
        @Req() req,
        @Body() dto: CreateProductDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.productsService.createProduct(req.user, dto, files);
    }

    // 🟡 API cập nhật sản phẩm
    // @Put(':id')
    // async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    //     return this.productsService.updateProduct(req.user, id, dto);
    // }
    @Put(':id')
    async update(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: UpdateProductDtoMoi,
    ) {
        return this.productsService.updateProduct(req.user, id, dto);
    }


    // 🔴 API xóa sản phẩm
    @Delete(':id')
    async delete(@Req() req, @Param('id') id: string) {
        return this.productsService.deleteProduct(req.user, id);
    }

    // 📖 API lấy tất cả sản phẩm
    @Get()
    async findAll() {
        return this.productsService.findAll();
    }

    // 📖 API lấy chi tiết sản phẩm
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }
}
