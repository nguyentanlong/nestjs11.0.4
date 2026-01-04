import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
    @PrimaryGeneratedColumn('uuid')
    jti: string;

    @Column()
    userId: string;

    @Column()
    expiresAt: Date;
}
