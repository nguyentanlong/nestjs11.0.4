import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

    @Column(/*{ default: 'user' }*/) // 'user' | 'admin'
    role: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}