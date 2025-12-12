// import { diskStorage } from 'multer';
// import { extname } from 'path';

// export const multerConfig = {
//     storage: diskStorage({
//         destination: './uploads', // thư mục lưu file
//         filename: (req, file, callback) => {
//             const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//             const ext = extname(file.originalname);
//             callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
//         },
//     }),
// };
// src/uploads/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';

// Hàm bỏ dấu tiếng Việt và chuẩn hóa tên file
function normalizeFileName(originalName: string): string {
    // 1. Bỏ phần mở rộng
    const nameWithoutExt = originalName.replace(extname(originalName), '');

    // 2. Chuyển về chữ thường
    let normalized = nameWithoutExt.toLowerCase();

    // 3. Bỏ dấu tiếng Việt
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 4. Thay khoảng trắng và ký tự đặc biệt bằng dấu -
    normalized = normalized.replace(/[^a-z0-9]+/g, '-');

    // 5. Bỏ dấu - thừa ở đầu/cuối
    normalized = normalized.replace(/^-+|-+$/g, '');

    return normalized;
}

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads', // thư mục lưu file
        filename: (req, file, callback) => {
            const ext = extname(file.originalname); // lấy phần mở rộng
            const baseName = normalizeFileName(file.originalname); // chuẩn hóa tên
            const finalName = `${baseName}-nguyen-tan-long${ext}`; // thêm hậu tố
            callback(null, finalName);
        },
    }),
};
