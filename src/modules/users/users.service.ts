import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { multerAvatarConfig } from 'src/up-files/multer.config';

import { hashPassword } from '../../common/utils/hash.util';  // tự hash
// cho update và delete
import { In, Not } from 'typeorm';  // cho multi delete
import { Role } from 'src/common/enums/enum.role';
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    // Admin tạo user (staff hoặc admin)
    async registerFromUsers(dto: CreateUserDto, file?: Express.Multer.File) {
        const exist = await this.userRepo.findOneBy({ email: dto.email });
        if (exist) throw new BadRequestException('Email đã tồn tại nha ku');

        const hashedPassword = await hashPassword(dto.password);

        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
            // role lấy từ dto (đã validate @IsEnum ở DTO), admin mới set được
        });

        if (file?.filename) {
            user.avatar = `mediaasset/avatars/${file.filename}`;
        }

        await this.userRepo.save(user);

        // Nếu muốn trả token như register public thì thêm generateTokens ở đây
        return user;  // hoặc { user, tokens }
    }
    // ... import hiện có + thêm


    // Update chính mình hoặc admin update any
    async update(id: string, updateData: UpdateUserDto, requesterRole: Role, requesterId: string, file: any) {
        if (requesterRole !== Role.ADMIN && id !== requesterId) {
            throw new ForbiddenException('Chỉ được update profile chính mình');
        }

        // Không cho update role nếu không phải admin
        if (updateData.role !== undefined && requesterRole !== Role.ADMIN) {
            throw new ForbiddenException('Chỉ admin mới được đổi role');
        } //check role nhiều dễ gây nhầm lẫn
        // XỬ LÝ FILE AVATAR RIÊNG (nếu có)
        // XỬ LÝ FILE AVATAR RIÊNG (nếu có)
        if (file?.filename) {
            updateData.avatar = `mediaasset/avatars/${file.filename}`;  // gán thủ công vào updateData
        }

        // CHECK RỖNG SAU KHI GÁN AVATAR
        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('Không có dữ liệu nào để update');  // hoặc return sớm nếu muốn 200
        }

        // HASH PASSWORD NẾU CÓ GỬI MỚI (quan trọng nhất)
        if (updateData.password) {
            updateData.password = await hashPassword(updateData.password);
        }

        // GÁN AVATAR THỦ CÔNG NẾU CÓ FILE
        // if (file?.filename) {
        //     (updateData as any).avatar = `mediaasset/avatars/${file.filename}`;
        // }

        // CHECK RỖNG SAU KHI XỬ LÝ
        // if (Object.keys(updateData).length === 0) {
        //     throw new BadRequestException('Không có dữ liệu nào để update nha ku');
        // }

        // TypeORM update chỉ ghi đè field có trong updateData, giữ nguyên field cũ nếu không gửi → đúng ý đệ!
        await this.userRepo.update(id, updateData as any);  // cast any tạm hoặc dùng DeepPartial<User>

        // await this.userRepo.update(id, updateData);
        return this.findOne(id);  // trả user sau update
    }

    // Soft delete (admin only)
    async softDelete(id: string) {
        const user = await this.findOne(id);
        if (user.deletedAt) throw new BadRequestException('User đã soft delete rồi');

        await this.userRepo.softDelete(id);  // TypeORM tự set deletedAt
        return { message: 'Soft delete thành công' };
    }

    // Hard delete single (admin only)
    async hardDelete(id: string) {
        await this.userRepo.delete(id);  // xóa cứng
        return { message: 'Hard delete thành công' };
    }

    // Hard delete multi (admin only)
    async hardDeleteMulti(ids: string[]) {
        await this.userRepo.delete({ id: In(ids) });
        return { message: `Hard delete ${ids.length} users thành công` };
    }

    // FindAll chỉ lấy user chưa soft delete
    async findAll(): Promise<User[]> {
        return this.userRepo.find({ withDeleted: false });  // TypeORM tự where deletedAt IS NULL
    }
    // async findAll(): Promise<User[]> {
    //     return this.userRepo.find({ where: { deletedAt: null } });
    // }
    // Các method khác (findAll, findOne, update, remove) giữ nguyên như cũ
    // async findAll(): Promise<User[]> {
    //     return this.userRepo.find();
    // }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) throw new NotFoundException(`Tài khoản #${id} không tìm thấy nha ku`);
        return user;
    }

    // ... update, remove tương tự
}