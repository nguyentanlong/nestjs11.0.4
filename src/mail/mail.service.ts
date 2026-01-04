import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService,
        private configService: ConfigService
    ) { }

    /*async testMail(to: string) {
        await this.mailerService.sendMail({
            to: 'nhamaytonthep@gmail.com',
            subject: 'Mail đến từ nhà phát triển mạnh phát',
            text: 'Nếu nhận được mail này là config thành công rồi!',
        }); return 'ok'
    }*/

    async sendVerificationEmail(email: string, token: string, fullName: string) {
        const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';//để chạy online
        const url = `${appUrl}/auth/verify-email?token=${token}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Xác thực email đăng ký',
            template: './verification',
            context: { url, fullName },
        });
    }

    async sendPasswordResetEmail(email: string, token: string, fullName: string) {
        const appUrl = this.configService.get<string>('APP_URL') ?? 'http://localhost:3000';
        const url = `${appUrl}/auth/reset-password?token=${token}`;
        //const url = `http://localhost:3000/auth/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to: email,
            subject: 'Đặt lại mật khẩu',
            template: 'reset-password',
            context: { url, fullName },
        });
    }
}