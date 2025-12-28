import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
// import { Role } from '../../common/enums/emum.role';

@Entity()
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.orders)
    user: User;  // owner order

    @Column('uuid')
    userId: string;  // index for query

    @Column('json')  // mảng sản phẩm mua
    products: { productId: string; quantity: number; price: number }[];

    @Column('decimal')
    totalAmount: number;  // tổng tiền

    @Column('enum', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'] })
    status: string;  // trạng thái order

    @Column({ nullable: true })
    cancelReason: string;  // lý do bùng (cancel)

    @Column({ nullable: true })
    returnReason: string;  // lý do trả hàng

    @Column()
    createdAt: Date;

    @Column({ nullable: true })
    updatedAt: Date;
}