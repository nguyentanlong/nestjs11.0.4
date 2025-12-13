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
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

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
        destination: './mediaasset', // thư mục lưu file
        filename: (req, file, callback) => {
            const ext = extname(file.originalname); // lấy phần mở rộng
            const baseName = normalizeFileName(file.originalname); // chuẩn hóa tên
            const uniqueSuffix = Date.now(); // hoặc uuid
            const finalName = `${baseName}-nguyen-tan-long-${uniqueSuffix}${ext}`; // thêm hậu tố
            callback(null, finalName);
        },
    }),
};
//Tạo folder theo ngày
// export const multerConfig = {
//   storage: diskStorage({
//     destination: (req, file, callback) => {
//       // Lấy ngày hiện tại (dd-mm)
//       const now = new Date();
//       const folderName = `${now.getDate()}-${now.getMonth() + 1}`;

//       // Thư mục đầy đủ
//       const uploadPath = `./mediaasset/${folderName}`;

//       // Nếu chưa có thư mục thì tạo mới
//       if (!existsSync(uploadPath)) {
//         mkdirSync(uploadPath, { recursive: true });
//       }

//       callback(null, uploadPath);
//     },
//     filename: (req, file, callback) => {
//       const ext = extname(file.originalname);
//       const baseName = normalizeFileName(file.originalname);
//       const uniqueSuffix = Date.now();
//       const finalName = `${baseName}-nguyen-tan-long-${uniqueSuffix}${ext}`;
//       callback(null, finalName);
//     },
//   }),
// };
// Config riêng cho avatar, cho chung 1 folder 
//Khi upload avatar, controller sẽ dùng FileInterceptor('avatar', multerAvatarConfig) thay vì multerConfig.
export const multerAvatarConfig = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            const uploadPath = join(process.cwd(), 'mediaasset', 'avatars');
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath, { recursive: true });
            }
            callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
            const ext = extname(file.originalname);
            const baseName = normalizeFileName(file.originalname);
            const uniqueSuffix = Date.now();
            const finalName = `${baseName}-avatar-${uniqueSuffix}${ext}`;
            callback(null, finalName);
        },
    }),
};
/*
📌 Cách 2: Dùng chung config nhưng phân loại theo fieldname
Nếu muốn gọn hơn, có thể dùng một config duy nhất, nhưng trong destination kiểm tra file.fieldname:

Nếu field là "avatar" → lưu vào mediaasset/avatars

Nếu field là "product" → lưu vào mediaasset/products
*/
// export const multerConfig = {
//   storage: diskStorage({
//     destination: (req, file, callback) => {
//       let folder = 'mediaasset/products';
//       if (file.fieldname === 'avatar') {
//         folder = 'mediaasset/avatars';
//       }
//       if (!existsSync(folder)) {
//         mkdirSync(folder, { recursive: true });
//       }
//       callback(null, folder);
//     },
//     filename: (req, file, callback) => {
//       const ext = extname(file.originalname);
//       const baseName = normalizeFileName(file.originalname);
//       const uniqueSuffix = Date.now();
//       const finalName = `${baseName}-${file.fieldname}-${uniqueSuffix}${ext}`;
//       callback(null, finalName);
//     },
//   }),
// };
