import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BlacklistService } from './blacklist.service';
import { hashPassword } from 'src/common/utils/hash.util';  // reuse hash
import { Role } from 'src/common/enums/enum.role';  // enum role

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService,
        private blacklistService: BlacklistService,
    ) { }

    async register(dto: RegisterDto, file?: Express.Multer.File) {
        const exist = await this.userRepo.findOneBy({ email: dto.email });
        if (exist) throw new BadRequestException('Email đã tồn tại nha ku');

        // HASH PASSWORD BẮT BUỘC (fix lỗ hổng lớn)
        const hashedPassword = await hashPassword(dto.password);

        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,          // override password đã hash
            role: Role.USER,                   // force USER cho register public → an toàn bảo mật
        });

        // Avatar upload (nếu có)
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

    public generateTokens(user: User) {
        return {
            accessToken: this.jwtService.sign({ sub: user.id, role: user.role }),
            refreshToken: this.jwtService.sign(
                { sub: user.id },
                { expiresIn: '7d' }
            ),
        };
    }

    async logout(refreshToken: string): Promise<void> {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const expiresIn = payload.exp - payload.iat;
            await this.blacklistService.add(refreshToken, expiresIn);
        } catch (error) {
            // token sai hoặc hết hạn → vẫn logout thành công
        }
    }

    async refreshToken(refreshToken: string) {
        const isBlacklisted = await this.blacklistService.isBlacklisted(refreshToken);
        if (isBlacklisted) {
            throw new UnauthorizedException('Token đã bị thu hồi (đã logout rồi)');
        }

        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.userRepo.findOneByOrFail({ id: payload.sub });

            return {
                accessToken: this.jwtService.sign(
                    { sub: user.id, role: user.role },
                    { expiresIn: '1y' },  // đệ để 1y hơi dài, có thể giảm còn 15m-1h
                ),
            };
        } catch {
            throw new UnauthorizedException('Refresh token không hợp lệ');
        }
    }
}