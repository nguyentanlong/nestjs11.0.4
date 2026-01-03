import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule, // để inject ConfigService
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get<string>('MAIL_HOST') ?? 'localhost',
                    port: parseInt(config.get<string>('MAIL_PORT') ?? '465', 10),
                    secure: true,
                    auth: {
                        user: config.get<string>('MAIL_USER') ?? '',
                        pass: config.get<string>('MAIL_PASS') ?? '',
                    },
                },
                defaults: {
                    from: '"No Reply" <nhamaytonthep@gmail.com>',
                },
                template: {
                    dir: process.cwd() + '/src/mail/templates',
                    adapter: new HandlebarsAdapter(),
                    options: { strict: true },
                },
            }),
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
