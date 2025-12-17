import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        // userRepo: truy cập bảng User trong DB qua TypeORM
    ) { }

    async create(dto: CreateUserDto) {
        const exist = await this.userRepo.findOne({ where: { email: dto.email } });
        if (exist) throw new NotFoundException('Email đã tồn tại');

        const hashed = await bcrypt.hash(dto.password, 10); // mã hóa mật khẩu
        const user = this.userRepo.create({ ...dto, password: hashed }); // tạo entity từ DTO
        await this.userRepo.save(user); // lưu xuống DB
        return user;
    }

    async findAll() {
        return this.userRepo.find(); // lấy toàn bộ users
    }

    async findOne(id: string) {
        const user = await this.userRepo.findOne({ where: { id } });
        // const user = await this.userRepo.findOneBy({ id: Number(id) });
        if (!user) throw new NotFoundException('User không tồn tại');
        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.findOne(id); // kiểm tra tồn tại
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10); // hash lại nếu đổi mật khẩu
        }
        /* xử lý nuul và undefined
        const updatedUser = {
    ...user,
    ...Object.fromEntries(
      Object.entries(dto).map(([key, value]) => [
        key,
        value !== null && value !== undefined ? value : user[key],
      ]),
    ),
  };
        */
        //cái này để xử lý null
        Object.keys(dto).forEach((key) => {
            if (dto[key] === null || dto[key] === undefined) {
                delete dto[key]; // bỏ field đó để merge không ghi đè
            }
        });

        //chỉ sử lý undefined
        const merged = this.userRepo.merge(user, dto); // gộp thay đổi vào entity
        await this.userRepo.save(merged); // lưu xuống DB
        return merged;
    }

    async remove(id: string) {
        const user = await this.findOne(id);
        await this.userRepo.remove(user); // xóa khỏi DB
        return { deleted: true, id };
    }
}
