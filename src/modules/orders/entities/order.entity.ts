import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
// import { Product } from '../../products/entities/product.entity';
// import { Role } from '../../common/enums/emum.role';

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // @ManyToOne(() => User, (user) => user.orders)
    // user: User;  // owner order

    @Column('uuid')
    userId: string;  // index for query
    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'userId' }) // ánh xạ userId với quan hệ user: User;
    user: User;
    // @ManyToOne(() => User, (user) => user.orders) userId: User;

    @Column('json')  // mảng sản phẩm mua
    // @ManyToOne(() => Product, product => product.orders)//tạo quan hệ với product
    products: { productId: string; quantity: number; price: number }[];

    @Column('decimal')
    totalAmount: number;  // tổng tiền

    //sql-better3 ko hỗ trợ
    // @Column('enum', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'] })
    // status: string;  // trạng thái order
    @Column({
        type: 'simple-enum',
        enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'],
        default: 'pending',
    })
    status: string;
    @Column({ nullable: true })
    cancelReason: string;  // lý do bùng (cancel)

    @Column({ nullable: true })
    returnReason: string;  // lý do trả hàng

    @Column()
    createdAt: Date;

    @Column({ nullable: true })
    updatedAt: Date;
}