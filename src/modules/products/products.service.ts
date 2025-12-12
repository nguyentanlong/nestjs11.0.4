// // Import các thư viện cần thiết
// import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
// import { Product } from './entities/product.entity';
// import { User } from '../users/entities/user.entity';


// @Injectable()
// export class ProductsService {
//     constructor(
//         // Inject repository để thao tác DB
//         @InjectRepository(Product)
//         private readonly productRepo: Repository<Product>,
//     ) { }

//     // 🟢 Tạo sản phẩm mới
//     async createProduct(user: User, dto: CreateProductDto) {
//         // Kiểm tra role: chỉ staff hoặc admin mới được tạo
//         if (user.role !== 'staff' && user.role !== 'admin') {
//             throw new ForbiddenException('Bạn không có quyền tạo sản phẩm');
//         }

//         // Tạo object product từ DTO
//         const product = this.productRepo.create({
//             ...dto,
//             createdBy: user.id, // gán user hiện tại
//             // productName: 'Test sản phẩm',
//             // shortDescription: 'Mô tả ngắn',
//             // description: 'Mô tả chi tiết',
//             // media: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
//             // price: 100000,
//             // stock: 10,
//             // createdBy: user.id,
//         });

//         // Lưu vào DB
//         console.log('DTO nhận được:', dto);// log ra xem lỗi
//         return this.productRepo.save(product);
//     }

//     // 🟡 Cập nhật sản phẩm
//     async updateProduct(user: User, id: string, dto: UpdateProductDto) {
//         // Tìm sản phẩm theo id
//         const product = await this.productRepo.findOne({ where: { id } });
//         if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

//         // Nếu không phải admin thì chỉ được sửa sản phẩm của mình
//         if (user.role !== 'admin' && product.createdBy !== user.id) {
//             throw new ForbiddenException('Bạn không có quyền sửa sản phẩm này');
//         }

//         // Gán dữ liệu mới
//         Object.assign(product, dto);
//         product.editReason = dto.editReason || 'Chỉnh sửa';

//         // Lưu lại
//         return this.productRepo.save(product);
//     }

//     // 🔴 Xóa sản phẩm (soft delete)
//     async deleteProduct(user: User, id: string) {
//         const product = await this.productRepo.findOne({ where: { id } });
//         if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

//         if (user.role !== 'admin' && product.createdBy !== user.id) {
//             throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
//         }

//         product.deleted = true; // đánh dấu đã xóa
//         return this.productRepo.save(product);
//     }

//     // 📖 Lấy tất cả sản phẩm (bao gồm chưa xóa)
//     async findAll() {
//         return this.productRepo.find();
//     }

//     // 📖 Lấy chi tiết sản phẩm theo id
//     async findOne(id: string) {
//         return this.productRepo.findOne({ where: { id } });
//     }
// }
// Import các thư viện cần thiết
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
    constructor(
        // Inject repository để thao tác DB
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) { }

    // 🟢 Tạo sản phẩm mới (hỗ trợ upload nhiều file)
    async createProduct(user: User, dto: CreateProductDto, files?: Express.Multer.File[]) {
        // Kiểm tra role: chỉ staff hoặc admin mới được tạo
        if (user.role !== 'staff' && user.role !== 'admin') {
            throw new ForbiddenException('Bạn không có quyền tạo sản phẩm');
        }

        // Nếu có file upload thì lấy path và gán vào media
        if (files && files.length > 0) {
            dto.media = files.map((file) => file.path);
        }

        // Tạo object product từ DTO
        const product = this.productRepo.create({
            ...dto,
            createdBy: user.id, // gán user hiện tại
        });

        // Lưu vào DB
        // console.log('DTO nhận được:', dto); // log ra xem dữ liệu
        return this.productRepo.save(product);
    }

    // 🟡 Cập nhật sản phẩm
    async updateProduct(user: User, id: string, dto: UpdateProductDto, files?: Express.Multer.File[]) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        if (user.role !== 'admin' && product.createdBy !== user.id) {
            throw new ForbiddenException('Bạn không có quyền sửa sản phẩm này');
        }

        // Nếu có file upload thì cập nhật lại media
        if (files && files.length > 0) {
            dto.media = files.map((file) => file.path);
        }

        Object.assign(product, dto);
        product.editReason = dto.editReason || 'Chỉnh sửa';

        return this.productRepo.save(product);
    }

    // 🔴 Xóa sản phẩm (soft delete)
    async deleteProduct(user: User, id: string) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        if (user.role !== 'admin' && product.createdBy !== user.id) {
            throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
        }

        product.deleted = true; // đánh dấu đã xóa
        return this.productRepo.save(product);
    }

    // 📖 Lấy tất cả sản phẩm
    async findAll() {
        return this.productRepo.find();
    }

    // 📖 Lấy chi tiết sản phẩm theo id
    async findOne(id: string) {
        return this.productRepo.findOne({ where: { id } });
    }
}
