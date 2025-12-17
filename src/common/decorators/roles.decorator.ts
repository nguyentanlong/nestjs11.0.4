import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);//phân quyên CRUD sản phẩm
export type UserRole = 'admin' | 'staff' | 'user';//phân quyền CRUD của user