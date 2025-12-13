import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { BlacklistService } from './blacklist.service';

// @Injectable()
// export class AuthService {}
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService,
        private blacklistService: BlacklistService, // để đăng xuất
    ) { }

    // async register(dto: RegisterDto) {
    //     const exist = await this.userRepo.findOneBy({ email: dto.email });
    //     if (exist) throw new BadRequestException('Email đã tồn tại nha ku');

    //     const user = this.userRepo.create(dto);
    //     await this.userRepo.save(user);

    //     return this.generateTokens(user);
    // }
    async register(dto: RegisterDto, file?: Express.Multer.File) {
        const exist = await this.userRepo.findOneBy({ email: dto.email });
        if (exist) throw new BadRequestException('Email đã tồn tại nha ku');

        const user = this.userRepo.create(dto);

        // Nếu có file avatar thì gán đường dẫn
        if (file?.filename) {
            user.avatar = `mediaasset/avatars/${file.filename}`;
        }

        await this.userRepo.save(user);

        return this.generateTokens(user);
    }

    async login(dto: LoginDto) {
        const user = await this.userRepo.findOneBy({ email: dto.email });
        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Email hoặc mật khẩu sai rồi đệ ơi');
        }

        return this.generateTokens(user);
    }

    private generateTokens(user: User) {
        return {
            accessToken: this.jwtService.sign({ sub: user.id, role: user.role }),
            refreshToken: this.jwtService.sign(
                { sub: user.id },
                { expiresIn: '7d' }
            ),
        };
    }
    // Hàm mới: Logout – đưa refreshToken vào blacklist
    async logout(refreshToken: string): Promise<void> {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const expiresIn = payload.exp - payload.iat; // thời gian còn lại của token
            await this.blacklistService.add(refreshToken, expiresIn);
        } catch (error) {
            // nếu token sai hoặc hết hạn → vẫn coi là logout thành công
        }
    }
    // Sửa lại hàm refreshToken để kiểm tra blacklist
    async refreshToken(refreshToken: string) {
        // BƯỚC 1: Kiểm tra token có bị blacklist chưa
        const isBlacklisted = await this.blacklistService.isBlacklisted(refreshToken);
        if (isBlacklisted) {
            throw new UnauthorizedException('Token đã bị thu hồi (đã logout rồi)');
        }

        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.userRepo.findOneByOrFail({ id: payload.sub });

            // BƯỚC 2: Cấp accessToken mới
            return {
                accessToken: this.jwtService.sign(
                    { sub: user.id, role: user.role },
                    { expiresIn: '1y' },
                ),
            };
        } catch {
            throw new UnauthorizedException('Refresh token không hợp lệ');
        }
    }
}