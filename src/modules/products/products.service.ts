// Import các thư viện cần thiết
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { unlinkSync } from 'fs';
import { join } from 'path';

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

        // Nếu có file upload thì lấy filename và gán vào media
        // ⚠️ KHÔNG dùng file.path vì multer config mới không có path, chỉ có filename
        if (files && files.length > 0) {
            dto.media = files.map((file) => file?.filename ? `mediaasset/${file.filename}` : null).filter((f) => f !== null); // lọc bỏ null
        }

        // Tạo object product từ DTO
        const product = this.productRepo.create({
            ...dto,
            createdBy: user.id, // gán user hiện tại
        });

        // Lưu vào DB
        return this.productRepo.save(product);
    }

    // 🟡 Cập nhật sản phẩm
    // async updateProduct(user: User, id: string, dto: UpdateProductDto, files?: Express.Multer.File[]) {
    //     console.log('FILES:', files);//thử
    //     if (files && files.length > 0) {
    //         files.forEach(f => console.log('File nhận được:', f.filename));
    //     }


    //     const product = await this.productRepo.findOne({ where: { id } });
    //     if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    //     // Kiểm tra quyền: chỉ admin hoặc chính chủ mới được sửa
    //     if (user.role !== 'admin' && product.createdBy !== user.id) {
    //         throw new ForbiddenException('Bạn không có quyền sửa sản phẩm này');
    //     }

    //     // Nếu có file upload mới thì thêm vào media
    //     if (files && files.length > 0) {
    //         const newFiles = files.map((file) => file?.filename ? `mediaasset/${file.filename}` : null).filter((f) => f !== null);

    //         product.media = [...(product.media || []), ...newFiles];
    //     }

    //     // Nếu client truyền media mới (ví dụ ["1.jpg","1.png","1.webp","1.docx"])
    //     if (Array.isArray(dto.media)) {
    //         const newMedia = dto.media.filter((f) => f != null && f !== '');

    //         // Tìm file nào bị xóa (có trong cũ nhưng không có trong mới)
    //         const removedFiles = (product.media || []).filter((f) => !newMedia.includes(f));

    //         // Xóa file khỏi thư mục mediaasset
    //         for (const filePath of removedFiles) {
    //             try {
    //                 unlinkSync(join(process.cwd(), filePath)); // xóa file vật lý
    //                 console.log(`Đã xóa file: ${filePath}`);
    //             } catch (err) {
    //                 console.error(`Không thể xóa file ${filePath}:`, err.message);
    //             }
    //         }

    //         // Cập nhật media mới
    //         product.media = newMedia;
    //     }

    //     // Gán các field khác từ dto (trừ media đã xử lý riêng)
    //     Object.assign(product, dto);

    //     // Nếu không có editReason thì gán mặc định
    //     product.editReason = dto.editReason || 'Chỉnh sửa';

    //     return this.productRepo.save(product);
    // }
    async toggleLikeProduct(productId: string, userId: string) {
        const product = await this.productRepo.findOneBy({ id: productId });
        if (!product) throw new NotFoundException('Product không tồn tại nha ku');

        if (!product.likedUsers) product.likedUsers = [];

        const hasLiked = product.likedUsers.includes(userId);

        if (hasLiked) {
            product.likedUsers = product.likedUsers.filter(id => id !== userId);
            product.likes -= 1;
        } else {
            product.likedUsers.push(userId);
            product.likes += 1;
        }

        await this.productRepo.save(product);

        return {
            message: hasLiked ? 'Unlike product thành công' : 'Like product thành công',
            likes: product.likes,
            hasLiked: !hasLiked,
        };
    }
    async updateProduct(
        user: User,
        id: string,
        dto: UpdateProductDto,
        files?: Express.Multer.File[],
    ) {
        // console.log('FILES:', files); // log thử xem có file không
        // if (files && files.length > 0) {
        //     files.forEach(f => console.log('File nhận được:', f.filename));
        // }

        // 🔎 Tìm sản phẩm theo id
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        // 🔒 Kiểm tra quyền: chỉ admin hoặc chính chủ mới được sửa
        if (user.role !== 'admin' && product.createdBy !== user.id) {
            throw new ForbiddenException('Bạn không có quyền sửa sản phẩm này');
        }

        // 🖼️ Nếu có file upload mới thì thêm vào media
        if (files && files.length > 0) {
            const newFiles = files
                .map(file => file?.filename ? `mediaasset/${file.filename}` : null)
                .filter(f => f !== null);

            product.media = [...(product.media || []), ...newFiles];
        }

        // 🖼️ Nếu client truyền media mới (ví dụ ["1.jpg","1.png"])
        if (Array.isArray(dto.media)) {
            const newMedia = dto.media.filter(f => f != null && f !== '');

            // Tìm file nào bị xóa (có trong cũ nhưng không có trong mới)
            const removedFiles = (product.media || []).filter(f => !newMedia.includes(f));

            // Xóa file khỏi thư mục mediaasset
            for (const filePath of removedFiles) {
                try {
                    unlinkSync(join(process.cwd(), filePath)); // xóa file vật lý
                    console.log(`Đã xóa file: ${filePath}`);
                } catch (err) {
                    console.error(`Không thể xóa file ${filePath}:`, err.message);
                }
            }

            // Cập nhật media mới
            product.media = newMedia;
        }

        // 📝 Gán các field khác từ dto (trừ media đã xử lý riêng)
        const { media, ...rest } = dto; // tách media ra để không ghi đè
        Object.assign(product, rest);

        // ✏️ Nếu không có editReason thì gán mặc định
        product.editReason = dto.editReason || 'Chỉnh sửa';

        // 💾 Lưu lại vào DB
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
    // 🗑️ Hàm riêng để xóa toàn bộ file media của sản phẩm
    private removeMediaFiles(media: string[] = []) {
        for (const filePath of media) {
            try {
                unlinkSync(join(process.cwd(), filePath)); // xóa file vật lý
                console.log(`Đã xóa file: ${filePath}`);
            } catch (err) {
                console.error(`Không thể xóa file ${filePath}:`, err.message);
            }
        }
    }

    //Xóa sản phẩm dưới DB
    // 🔴 Xóa sản phẩm hoàn toàn (hard delete)
    async hardDeleteProduct(user: User, id: string) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        // Kiểm tra quyền: chỉ admin hoặc chính chủ mới được xóa
        if (user.role !== 'admin' && product.createdBy !== user.id) {
            throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
        }
        // 🗑️ Xóa luôn các file media liên quan
        if (Array.isArray(product.media) && product.media.length > 0) {
            this.removeMediaFiles(product.media);
        }

        // Xóa hẳn record khỏi DB
        await this.productRepo.remove(product);
        //         remove(product) → cần fetch entity trước, rồi xóa.

        // delete(id) → xóa trực tiếp theo id, không cần fetch entity.

        // 👉 Nhưng remove() tiện hơn nếu đệ muốn kiểm tra quyền hoặc log thông tin trước khi xóa.

        return { message: 'Sản phẩm đã được xóa hoàn toàn khỏi DB' };
    }
    // 🗑️ Hàm riêng để xóa một file media theo tên
    private removeMediaFile(filePath: string) {
        try {
            unlinkSync(join(process.cwd(), filePath)); // xóa file vật lý
            console.log(`Đã xóa file: ${filePath}`);
        } catch (err) {
            console.error(`Không thể xóa file ${filePath}:`, err.message);
        }
    }

    // 🟡 Xóa một file media của sản phẩm
    async deleteProductMedia(user: User, id: string, filename: string) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        // Kiểm tra quyền: chỉ admin hoặc chính chủ mới được xóa
        if (user.role !== 'admin' && product.createdBy !== user.id) {
            throw new ForbiddenException('Bạn không có quyền xóa media của sản phẩm này');
        }

        // Tìm file cần xóa trong media
        const filePath = (product.media || []).find(f => f.endsWith(filename));
        if (!filePath) {
            throw new NotFoundException('Không tìm thấy file trong media của sản phẩm');
        }

        // Xóa file vật lý
        this.removeMediaFile(filePath);

        // Cập nhật lại mảng media trong DB
        product.media = (product.media || []).filter(f => !f.endsWith(filename));
        await this.productRepo.save(product);

        return { message: `Đã xóa file ${filename} khỏi sản phẩm ${id}` };
    }

    // 🗑️ Hàm riêng để xóa nhiều file media
    private removesMediaFiles(media: string[] = []) {
        for (const filePath of media) {
            try {
                unlinkSync(join(process.cwd(), filePath)); // xóa file vật lý
                console.log(`Đã xóa file: ${filePath}`);
            } catch (err) {
                console.error(`Không thể xóa file ${filePath}:`, err.message);
            }
        }
    }

    // 🟡 Xóa nhiều file media hoặc toàn bộ media của sản phẩm
    async deleteProductMedias(user: User, id: string, filenames?: string[]) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

        // Kiểm tra quyền: chỉ admin hoặc chính chủ mới được xóa
        if (user.role !== 'admin' && product.createdBy !== user.id) {
            throw new ForbiddenException('Bạn không có quyền xóa media của sản phẩm này');
        }

        // Nếu truyền danh sách filenames → chỉ xóa những file đó
        if (filenames && filenames.length > 0) {
            const filesToDelete = (product.media || []).filter(f =>
                filenames.some(name => f.endsWith(name))
            );

            this.removesMediaFiles(filesToDelete);

            // Cập nhật lại media (loại bỏ những file đã xóa)
            product.media = (product.media || []).filter(f =>
                !filenames.some(name => f.endsWith(name))
            );
        } else {
            // Nếu không truyền filenames → xóa toàn bộ media
            this.removesMediaFiles(product.media || []);
            product.media = [];
        }

        await this.productRepo.save(product);

        return { message: filenames?.length ? 'Đã xóa các file media đã chọn' : 'Đã xóa toàn bộ media của sản phẩm' };
    }
    // 🟡 Xóa nhiều file media từ nhiều sản phẩm khác nhau
    async deleteMultipleMedias(user: User, filesToDelete: { productId: string; filename: string }[]) {
        // Nếu không phải admin thì chỉ cho phép xóa file thuộc sản phẩm của chính user
        if (user.role !== 'admin') {
            // Lọc lại danh sách chỉ giữ những file thuộc sản phẩm do user tạo
            const ownedFiles: { productId: string; filename: string }[] = [];
            for (const item of filesToDelete) {
                const product = await this.productRepo.findOne({ where: { id: item.productId } });
                if (product && product.createdBy === user.id) {
                    ownedFiles.push(item);
                }
            }
            filesToDelete = ownedFiles;
        }

        // Xử lý xóa từng file
        for (const item of filesToDelete) {
            const product = await this.productRepo.findOne({ where: { id: item.productId } });
            if (!product) continue;

            // Tìm file trong media
            const filePath = (product.media || []).find(f => f.endsWith(item.filename));
            if (!filePath) continue;

            // Xóa file vật lý
            try {
                unlinkSync(join(process.cwd(), filePath));
                console.log(`Đã xóa file: ${filePath}`);
            } catch (err) {
                console.error(`Không thể xóa file ${filePath}:`, err.message);
            }

            // Cập nhật lại media trong DB
            product.media = (product.media || []).filter(f => !f.endsWith(item.filename));
            await this.productRepo.save(product);
        }

        return { message: 'Đã xóa các file media đã chọn từ nhiều sản phẩm' };
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
