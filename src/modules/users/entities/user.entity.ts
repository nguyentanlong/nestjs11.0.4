import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, DeleteDateColumn, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/common/enums/enum.role';
import { Comment } from 'src/modules/comments/entities/comment.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    username: string;

    @Column()
    address: string;

    @Column()
    fullName: string;

    // @Column()
    // friendly: number;
    // 🖼️ Avatar (có thể để trống)
    @Column({ type: 'varchar', nullable: true })
    avatar?: string; // lưu đường dẫn file, ví dụ: "mediaasset/avatars/abc.jpg"

    // 🤝 Friendly (mặc định = 0)
    @Column({ type: 'int', default: 0 })
    friendly: number;

    @Column()
    phone: string;

    //better-sql3 ko hỗ trợ kiểu này
    // @Column({ type: 'enum', enum: Role, default: Role.USER })
    // role: Role;
    //để set quyền
    @Column({
        type: 'simple-enum',  // quan trọng: dùng simple-enum thay vì enum
        enum: Role,           // giữ enum TS để type-safe
        default: Role.USER,   // default an toàn
    })
    role: Role;

    @OneToMany(() => Comment, (comment) => comment.user)
    comments: Comment[];
    // @BeforeInsert()
    // async hashPassword() {
    //     this.password = await bcrypt.hash(this.password, 10);
    // }
    @DeleteDateColumn({
        type: 'datetime',   // hoặc 'text' nếu muốn, nhưng datetime tốt hơn
        nullable: true
    })
    deletedAt?: Date;
}