import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

// src/modules/auth/entities/verification-token.entity.ts
@Entity()
export class VerificationToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    jti: string;  // JWT ID unique

    @Column()
    userId: string;

    @Column()
    expiresAt: Date;

    @Column({ default: false })
    used: boolean;
}