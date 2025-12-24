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
// import {
//     Injectable,
//     CanActivate,
//     ExecutionContext,
//     ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class RolesGuard implements CanActivate {
//     constructor(private reflector: Reflector) { }

//     canActivate(context: ExecutionContext): boolean {
//         const roles = this.reflector.get<string[]>('roles', context.getHandler());
//         if (!roles) return true;

//         const request = context.switchToHttp().getRequest();
//         const user = request.user; // { id, role } từ JwtStrategy.validate

//         // Nếu role không nằm trong danh sách yêu cầu => cấm
//         if (!roles.includes(user?.role)) {
//             throw new ForbiddenException('Không đủ quyền');
//         }

//         // Nếu là admin => cho phép toàn quyền
//         if (user.role === 'admin') return true;

//         // Nếu là staff/user => chỉ cho phép thao tác trên chính họ
//         // const paramsId = request.params?.id;
//         // if (paramsId && String(user.id) !== String(paramsId)) {
//         //     throw new ForbiddenException('Chỉ được thao tác trên tài khoản của chính mình');
//         // }
//         const paramsId = request.params?.id;
//         if (paramsId && paramsId !== request.user.id) {  // so sánh string === string
//             throw new ForbiddenException('Chỉ được thao tác trên tài khoản của chính mình');
//         }
//         return true;
//     }
// }
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';  // key từ decorator
import { Role } from '../enums/enum.role';                  // import enum
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Lấy roles từ metadata (bây giờ là Role[] thay vì string[])
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Nếu không yêu cầu role nào → cho qua (public route)
        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException('Không đủ quyền nha ku test user');  // fallback nếu JwtGuard lỗi
        }

        // Check role có nằm trong requiredRoles không (type-safe)
        // console.log('user.role:', user.role);
        // console.log('requiredRoles:', requiredRoles);

        if (!requiredRoles.some(r => r === user.role)) {  // dùng some + === string//if (!requiredRoles.includes(user.role as Role)) {
            console.log('user.role:', user.role);
            console.log('requiredRoles:', requiredRoles);
            throw new ForbiddenException('Không đủ quyền để làm nha ku test role');
        }

        // ADMIN bypass ownership check
        if (user.role === Role.ADMIN) {
            return true;
        }
        //cho phép staff và user CRUD trên chính tài khoản của mình
        // ADMIN bypass ownership hoàn toàn
        // if (user.role === Role.ADMIN) return true;
        const request = context.switchToHttp().getRequest<Request>();  // thêm <Request> generic
        // OWNERSHIP CHECK cho cả /:id và /me
        const paramsId = request.params?.id;
        const isMeRoute = request.url.endsWith('/me') || request.url.includes('/me');

        if (paramsId || isMeRoute) {
            // Nếu có params.id → check id khớp user.id
            // Nếu là /me route → luôn pass ownership (vì service đã dùng req.user.id)
            if (paramsId && paramsId !== user.id) {
                throw new ForbiddenException('Chỉ được thao tác trên tài khoản của chính mình');
            }
            // isMeRoute thì pass luôn
            // STAFF & USER: chỉ thao tác trên chính mình (UUID string)
            // const paramsId = context.switchToHttp().getRequest().params?.id;
            // if (paramsId && paramsId !== user.id) {
            //     throw new ForbiddenException('Chỉ được thao tác trên tài khoản của chính mình');
            // }
        }
        // === THÊM PHẦN CHECK QUYỀN CHO COMMENT TẠI ĐÂY ===
        // Route comment: /products/:productId/comments/:id → có "/comments/" trong url và có params.id
        const isCommentRoute = request.url.includes('/comments/');
        const hasCommentId = request.params?.id !== undefined;

        if (isCommentRoute && hasCommentId) {
            // Ở guard chỉ detect route comment cần ownership
            // Check thực tế comment.userId === user.id để service handle (pro + chính xác)
            // Guard không query repo → nhẹ
            // Service sẽ load comment + check userId
        }
        // Không throw gì ở guard cho comment – để service check chi tiết
        // ================================================

        return true;
    }
}