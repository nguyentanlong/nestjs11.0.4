import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationToken } from 'src/modules/auth/entities/verification-token.entity';
import { Repository, LessThan } from 'typeorm';


@Injectable()
export class TokenCleanupCron {
    constructor(
        @InjectRepository(VerificationToken)
        private readonly verificationTokenRepo: Repository<VerificationToken>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanExpiredTokens() {
        await this.verificationTokenRepo.delete({
            expiresAt: LessThan(new Date()),
        });
    }
}
