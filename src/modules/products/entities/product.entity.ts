import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    productName: string;

    @Column()
    shortDescription: string;

    @Column('text')
    description: string;

    @Column('simple-json', { nullable: true })
    media: string[]; // chứa nhiều hình, video, file (lưu path hoặc URL)

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('int')
    stock: number;

    @Column()
    createdBy: string; // userId

    @CreateDateColumn()
    postDay: Date;

    @Column({ nullable: true })
    editReason: string;

    @Column({ default: false })
    deleted: boolean;
}
