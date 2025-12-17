// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class RolesGuard implements CanActivate {
//     constructor(private reflector: Reflector) { }

//     canActivate(context: ExecutionContext): boolean {
//         const roles = this.reflector.get<string[]>('roles', context.getHandler());
//         // const userCrud = request.user; // { id, role } từ JwtStrategy.validate
//         if (!roles) return true;

//         const request = context.switchToHttp().getRequest();
//         const user = request.user;
//         return roles.includes(user?.role);
//     }
// }
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user; // { id, role } từ JwtStrategy.validate

        // Nếu role không nằm trong danh sách yêu cầu => cấm
        if (!roles.includes(user?.role)) {
            throw new ForbiddenException('Không đủ quyền');
        }

        // Nếu là admin => cho phép toàn quyền
        if (user.role === 'admin') return true;

        // Nếu là staff/user => chỉ cho phép thao tác trên chính họ
        // const paramsId = request.params?.id;
        // if (paramsId && String(user.id) !== String(paramsId)) {
        //     throw new ForbiddenException('Chỉ được thao tác trên tài khoản của chính mình');
        // }
        const paramsId = request.params?.id;
        if (paramsId && paramsId !== request.user.id) {  // so sánh string === string
            throw new ForbiddenException('Chỉ được thao tác trên tài khoản của chính mình');
        }
        return true;
    }
}
