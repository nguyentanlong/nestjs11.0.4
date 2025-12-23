import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    content: string;

    @ManyToOne(() => User, (user) => user.comments)
    @JoinColumn({ name: 'userId' })
    user: User;  // creator

    @ManyToOne(() => Product, (product) => product.comments)
    @JoinColumn({ name: 'productId' })
    product: Product;  // comment on product

    @ManyToOne(() => Comment, (parent) => parent.replies, { nullable: true })
    @JoinColumn({ name: 'parentId' })
    parent: Comment;  // for reply (null if top-level)

    @OneToMany(() => Comment, (reply) => reply.parent)
    replies: Comment[];

    @Column('simple-array', { nullable: true })
    tags: string[];  // tag usernames, e.g. ['@user1', '@user2']

    @Column({ default: 0 })
    likes: number;  // like count (or use Like entity for full like/unlike)
    @Column('uuid')
    userId: string;  // index user

    @Column('uuid')
    productId: string;

    @Column('uuid', { nullable: true })
    parentId: string | null;

    @Column({ nullable: true })
    deletedAt?: Date;  // soft delete
}