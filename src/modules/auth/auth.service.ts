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
import { MailService } from '../../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { VerificationToken } from './entities/verification-token.entity';
import { PasswordResetToken } from 'src/common/entities/password-reset-token.entity';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,  // index 0: UserRepository
        @InjectRepository(VerificationToken) private readonly verificationTokenRepo: Repository<VerificationToken>,  // thêm dòng này
        @InjectRepository(PasswordResetToken)
        private readonly resetTokenRepo: Repository<PasswordResetToken>,
        private jwtService: JwtService,  // index 1
        private blacklistService: BlacklistService,  // index 2
        private mailService: MailService,  // index 3: MailService
        // private readonly verificationTokenRepo: Repository<VerificationToken>,
        // @InjectRepository(User) private userRepo: Repository<User>,
        // private readonly verificationTokenRepo: Repository<VerificationToken>,
        // private jwtService: JwtService,
        // private blacklistService: BlacklistService,
        // private readonly mailService: MailService,
    ) { }

    async register(dto: RegisterDto, file?: Express.Multer.File) {
        const exist = await this.userRepo.findOneBy({ email: dto.email });

        if (exist) {
            if (!exist.isEmailVerified) {
                // Trường hợp user đã tồn tại nhưng chưa xác thực
                const jti = uuidv4();
                const verifyToken = this.jwtService.sign(
                    { sub: exist.id, jti },
                    { secret: process.env.JWT_VERIFY_SECRET, expiresIn: '5m' },
                );

                const tokenRecord = this.verificationTokenRepo.create({
                    jti,
                    userId: exist.id,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                });
                await this.verificationTokenRepo.save(tokenRecord);

                await this.mailService.sendVerificationEmail(exist.email, verifyToken, exist.fullName);//gọi hàm gửi mail

                return { message: 'Email đã tồn tại nhưng chưa xác thực. Đã gửi lại mail xác thực.' };
            } else {
                // Trường hợp user đã tồn tại và đã xác thực
                throw new BadRequestException('Email đã tồn tại và đã xác thực nha ku');
                // Nếu muốn xóa record thì thay bằng:
                // await this.userRepo.delete(exist.id);
                // throw new BadRequestException('Email đã tồn tại và đã xác thực, record đã bị xóa.');
            }
        }

        // Nếu không tồn tại thì code sẽ đi tiếp xuống phần tạo user mới

        // Nếu chưa tồn tại thì tạo user mới
        const hashedPassword = await hashPassword(dto.password);
        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
            role: Role.USER,
            isEmailVerified: false,
        });

        if (file?.filename) {
            user.avatar = `mediaasset/avatars/${file.filename}`;
        }

        await this.userRepo.save(user);

        // Tạo token verify cho user mới
        const jti = uuidv4();
        const verifyToken = this.jwtService.sign(
            { sub: user.id, jti },
            { secret: process.env.JWT_VERIFY_SECRET, expiresIn: '5m' },
        );

        const tokenRecord = this.verificationTokenRepo.create({
            jti,
            userId: user.id,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });
        await this.verificationTokenRepo.save(tokenRecord);

        await this.mailService.sendVerificationEmail(user.email, verifyToken, String(user.fullName) || "Bạn");

        return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.', tokens: this.generateTokens(user) };
    }

    // async login(dto: LoginDto) {
    //     // console.log('Login attempt:', dto.email);  // log email nhập

    //     // const user1 = await this.userRepo.findOneBy({ email: dto.email });
    //     // console.log('Found user:', user1 ? 'Yes' : 'No');  // có tìm thấy user không
    //     const user = await this.userRepo.findOneBy({ email: dto.email });
    //     if (!user || !(await bcrypt.compare(dto.password, user.password))) {
    //         throw new UnauthorizedException('Email hoặc mật khẩu sai rồi đệ ơi');
    //     }

    //     return this.generateTokens(user);
    // }
    // Đã có import bcrypt và hashPassword util

    // Verify email token (1 giờ hết hạn)
    /*async verifyEmail(token: string) {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });
        const user = await this.userRepo.findOneBy({ id: payload.sub });
        if (!user) throw new BadRequestException('Token không hợp lệ');

        user.isEmailVerified = true;
        await this.userRepo.save(user);
        return { message: 'Xác thực email thành công' };
    }*/

    /*async verifyEmail(token: string) {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });

        const tokenRecord = await this.verificationTokenRepo.findOneBy({ jti: payload.jti, userId: payload.sub });
        if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        const user = await this.userRepo.findOneBy({ id: payload.sub });
        if (!user) { throw new BadRequestException('Không tìm thấy user'); }
        user.isEmailVerified = true;
        await this.userRepo.save(user);

        // Đánh dấu used + xóa record (hoặc soft delete)
        tokenRecord.used = true;
        await this.verificationTokenRepo.remove(tokenRecord);  // xóa luôn

        return { message: 'Xác thực thành công' };
    }*/
    // Forgot password
    /*async verifyEmail(token: string) {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });

        const tokenRecord = await this.verificationTokenRepo.findOneBy({
            jti: payload.jti,
            userId: payload.sub
        });

        if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        const user = await this.userRepo.findOneBy({ id: payload.sub });
        if (!user) throw new BadRequestException('User không tồn tại');

        user.isEmailVerified = true;
        await this.userRepo.save(user);

        // Xóa record token vừa dùng (theo id) → an toàn 100%
        await this.verificationTokenRepo.delete(tokenRecord.id);

        // Nếu muốn xóa tất cả token khác của user này (đã xác thực) để DB sạch hơn
        await this.verificationTokenRepo.delete({ userId: user.id }); // <--- thêm dòng này

        return { message: 'Xác thực thành công' };
    }*/

    /* async verifyEmail(token: string) {
         const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });
 
         // Load full entity (có id)
         const tokenRecord = await this.verificationTokenRepo.findOne({
             where: { jti: payload.jti, userId: payload.sub },
         });
 
         if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
             throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
         }
 
         const user = await this.userRepo.findOneBy({ id: payload.sub });
         if (!user) throw new BadRequestException('User không tồn tại');
 
         user.isEmailVerified = true;
         await this.userRepo.save(user);
 
         // XÓA AN TOÀN: dùng delete bằng id (không phụ thuộc entity partial)
         await this.verificationTokenRepo.delete(tokenRecord.id);
 
         // Bonus: xóa tất cả token cũ của user này (DB sạch)
         await this.verificationTokenRepo.delete({ userId: payload.sub });
 
         return { message: 'Xác thực thành công' };
     }*/

    /*async verifyEmail(token: string) {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });

        // Check token record tồn tại + valid
        const tokenRecord = await this.verificationTokenRepo.findOneBy({
            jti: payload.jti,
            userId: payload.sub,
        });

        if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        const user = await this.userRepo.findOneBy({ id: payload.sub });
        if (!user) throw new BadRequestException('User không tồn tại');

        user.isEmailVerified = true;
        await this.userRepo.save(user);

        // FIX: dùng query delete raw bằng jti + userId (an toàn SQLite)
        await this.verificationTokenRepo
            .createQueryBuilder()
            .delete()
            .from('verification_token')
            .where('jti = :jti AND userId = :userId', { jti: payload.jti, userId: payload.sub })
            .execute();

        // Bonus: xóa tất cả token cũ của user (DB sạch)
        await this.verificationTokenRepo.delete({ userId: payload.sub });

        return { message: 'Xác thực thành công' };
    }*/

    /*async verifyEmail(token: string) {
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });

        const tokenRecord = await this.verificationTokenRepo.findOneBy({
            jti: payload.jti,
            userId: payload.sub,
        });

        if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        // Parallel save user + delete token (tối ưu nhất)
        await Promise.all([
            this.userRepo.update(payload.sub, { isEmailVerified: true }),  // nhanh hơn save full entity
            this.verificationTokenRepo.delete({ jti: payload.jti }),       // delete raw
            // Hoặc xóa tất cả token của user (DB sạch hơn)
            this.verificationTokenRepo.delete({ userId: payload.sub })
        ]);

        return { message: 'Xác thực thành công' };
    }*/

    async verifyEmail(token: string) {
        // console.log("Token input:", token);
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });
        // console.log("Payload:", payload);
        const tokenRecord = await this.verificationTokenRepo.findOneBy({
            jti: payload.jti,
            userId: payload.sub,
        });
        // console.log("TokenRecord:", tokenRecord);
        if (!tokenRecord || tokenRecord.used || new Date() > tokenRecord.expiresAt) {
            throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
        }

        const user = await this.userRepo.findOneBy({ id: payload.sub });
        if (!user) throw new BadRequestException('User không tồn tại');

        // Update verify
        // console.log("Payload.sub", user.id);
        // console.log("userId trong verification toke", tokenRecord.userId);
        user.isEmailVerified = true;
        await this.userRepo.save(user);

        // Xóa token vừa dùng theo id (an toàn) 
        await this.verificationTokenRepo.delete(tokenRecord.id);
        // XÓA TẤT CẢ token của user (sạch DB)
        await this.verificationTokenRepo.delete({ userId: payload.sub });

        return { message: 'Xác thực thành công' };
    }
    async forgotPassword(email: string) {
        const user = await this.userRepo.findOneBy({ email });
        if (!user) return { message: 'Nếu email tồn tại, link reset sẽ được gửi' };  // chống enum
        const jti = uuidv4();
        const token = this.jwtService.sign({ sub: user.id, jti }, { secret: process.env.JWT_RESET_SECRET, expiresIn: '5m' },);
        const tokenRecord = this.resetTokenRepo.create({ jti, userId: user.id, expiresAt: new Date(Date.now() + 15 * 60 * 1000), }); await this.resetTokenRepo.save(tokenRecord); await this.mailService.sendPasswordResetEmail(user.email, token, user.fullName ?? 'Bạn'); return { message: 'Đã gửi email đặt lại mật khẩu' };
        // const token = this.jwtService.sign(
        //     { sub: user.id },
        //     { secret: process.env.JWT_RESET_SECRET, expiresIn: '5m' },
        // );

        // await this.mailService.sendPasswordResetEmail(email, token, user.fullName);
        // return { message: 'Link reset đã gửi (nếu email tồn tại)' };
    }
    async resetPassword(token: string, newPassword: string) {
        try {
            // 1. Verify token
            const payload = this.jwtService.verify(token, { secret: process.env.JWT_RESET_SECRET });

            // 2. Tìm token trong DB
            const tokenRecord = await this.resetTokenRepo.findOneBy({ jti: payload.jti, userId: payload.sub });

            if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
                throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
            }

            // 3. Hash mật khẩu mới
            const hashedPassword = await hashPassword(newPassword);

            // 4. Update mật khẩu xuống bảng user
            await this.userRepo.update(payload.sub, { password: hashedPassword });

            // 5. Xóa token vừa dùng và tất cả token reset khác của user
            await this.resetTokenRepo.delete({ userId: payload.sub });

            return { message: 'Đặt lại mật khẩu thành công' };
        } catch (e) {
            throw new BadRequestException('Token không hợp lệ');
        }
    }


    async login(dto: LoginDto) {
        // console.log('Login attempt:', dto.email);

        const user = await this.userRepo.findOneBy({ email: dto.email });
        // console.log('Found user:', user ? 'Yes' : 'No');
        // console.log('Password hash: ', user?.hashPassword, 'password goc: ', user?.password)
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu sai rồi đệ ơi');
        }
        if (!user.isEmailVerified) {
            throw new UnauthorizedException('Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Email hoặc mật khẩu sai');

        // Thay bcrypt.compare bằng cách thủ công từ utils để chắc chắn cùng algo
        // const isMatch = await bcrypt.compare(dto.password, user.password);
        // Nếu vẫn false, test thủ công:
        // const manualHash = await hashPassword(dto.password);  // hash lại input
        // console.log('Manual re-hash match DB?', manualHash === user.password);

        // console.log('Password match:', isMatch);

        // if (!isMatch) {
        // throw new UnauthorizedException('Email hoặc mật khẩu sai rồi đệ ơi');
        // }

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