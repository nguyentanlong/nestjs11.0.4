// DTO dùng khi tạo user mới
export class CreateUserDto {
    email: string; // email đăng nhập
    password: string; // mật khẩu (sẽ được hash trong service)
    role: 'admin' | 'staff' | 'user'; // phân quyền
}
