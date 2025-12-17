import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/enum.role';

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
    fullname: string;

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
    @Column({
        type: 'simple-enum',  // quan trọng: dùng simple-enum thay vì enum
        enum: Role,           // giữ enum TS để type-safe
        default: Role.USER,   // default an toàn
    })
    role: Role;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}