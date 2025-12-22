import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config"; // thêm ConfigService
import { Role } from "src/common/enums/enum.role";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            // Lấy token từ header Authorization: Bearer <token>
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // Không bỏ qua hạn token, sẽ kiểm tra expired
            ignoreExpiration: false,
            // Lấy secret từ .env qua ConfigService
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    // Hàm validate: giữ nguyên logic của đệ
    async validate(payload: any) {
        // Trả về object user để gắn vào req.user
        return { id: payload.sub, role: payload.role as Role };  // cast để TS biết req.user.role là Role
    }
}
