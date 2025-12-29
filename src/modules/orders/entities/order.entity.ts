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

    @Column('real', { nullable: true })
    price: number;

    // sqlife ko hỗ trợ decimal
    // @Column('decimal', { precision: 10, scale: 2, default: 0 })
    // price: number;  // thêm vào struct products ko thì bị lỗi Nan
    // @ManyToOne(() => User, (user) => user.orders) userId: User;

    @Column('json')  // mảng sản phẩm mua
    // @ManyToOne(() => Product, product => product.orders)//tạo quan hệ với product
    products: { productId: string; quantity: number; price: number }[];

    @Column('float'/*'decimal', {
        precision: 10, scale: 2, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    }*/)
    totalAmount: number;  // tổng tiền

    //sql-better3 ko hỗ trợ
    // @Column('enum', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned'] })
    // status: string;  // trạng thái order
    @Column({
        type: 'simple-enum',
        enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'returned', 'partial_cancelled', 'partial_returned'],
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