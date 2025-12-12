import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Cache } from 'cache-manager';

// Dịch vụ này chuyên lưu refreshToken đã bị logout (blacklist)
@Injectable()
export class BlacklistService implements OnModuleInit, OnModuleDestroy {
    private store = new Map<string, number>(); // tạm dùng Map thay Redis khi dev

    constructor() { }

    // Khi module khởi động
    onModuleInit() {
        console.log('Blacklist service đã sẵn sàng');
    }

    // Khi tắt app
    onModuleDestroy() {
        this.store.clear();
    }

    // Thêm token vào danh sách đen, hết hạn sau X giây
    async add(token: string, expiresInSeconds: number): Promise<void> {
        const expiresAt = Date.now() + expiresInSeconds * 1000;
        this.store.set(token, expiresAt);
    }

    // Kiểm tra token có bị blacklist chưa
    async isBlacklisted(token: string): Promise<boolean> {
        const expiresAt = this.store.get(token);
        if (!expiresAt) return false;

        if (Date.now() > expiresAt) {
            this.store.delete(token); // tự dọn rác
            return false;
        }
        return true;
    }
}