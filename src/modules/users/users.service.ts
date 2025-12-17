import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { Role } from '../../common/enums/role.enum';
import { hashPassword } from '../../common/utils/hash.util';  // tự hash

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

    // Các method khác (findAll, findOne, update, remove) giữ nguyên như cũ
    async findAll(): Promise<User[]> {
        return this.userRepo.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) throw new NotFoundException(`Tài khoản #${id} không tìm thấy nha ku`);
        return user;
    }

    // ... update, remove tương tự
}