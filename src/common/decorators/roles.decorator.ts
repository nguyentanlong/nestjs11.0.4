import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/enum.role';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);//phân quyên CRUD sản phẩm
// lấy role trực tiếp ko an toàn, chuyên nghiệp
// export type UserRole = 'admin' | 'staff' | 'user';//phân quyền CRUD của user


export const ROLES_KEY = 'roles';
// export const UserRole = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);