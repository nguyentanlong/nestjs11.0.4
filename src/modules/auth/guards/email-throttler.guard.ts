// import { ThrottlerGuard } from '@nestjs/throttler';
// import { Injectable } from '@nestjs/common';
// import { ExecutionContext } from '@nestjs/core';

// @Injectable()
// export class EmailThrottlerGuard extends ThrottlerGuard {
//   protected getTracker(req: Record<string, any>): string {
//     return req.body.email?.toLowerCase() || req.ip;  // key bằng email
//   }
// }
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class EmailThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Request): Promise<string> {
        // Ưu tiên email, fallback về IP
        return req.body?.email?.toLowerCase() || req.ip;
    }
    // Override để dùng ExecutionContext (an toàn hơn Request)
    protected getRequestResponse(context: ExecutionContext) {
        const http = context.switchToHttp();
        return { req: http.getRequest<Request>(), res: http.getResponse() };
    }
}
