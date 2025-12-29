import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Order } from '../../orders/entities/order.entity';
@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    productName: string;

    @Column("text", { array: true, nullable: true })
    keywords: string[];

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

    @OneToMany(() => Comment, (comment) => comment.product)
    comments: Comment[];

    @Column({ default: 0 })
    likes: number;
    // Thêm ngay sau cột likes hoặc cuối entity
    @Column('simple-array', { nullable: true, default: () => "'{}'" })
    likedUsers: string[];  // mảng userId (UUID) đã like product này

    //tạo quan hệ giữa product và order
    // @OneToMany(() => Order, (order) => order.products)  // note: order.products là array, không direct relation
    // orders?: Order;//[];  // optional, vì order.products là json array, không direct relation

    // không tạo quan hệ giữa product và order
    // @Column('json')
    // products: { productId: string; quantity: number; price: number }[];

    @Column({ default: false })
    deleted: boolean;
}
