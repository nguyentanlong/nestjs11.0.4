import { JwtPayload } from '../auth/types/jwt-payload.interface';  // import để xử lý role.user.
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // guard JWT của đệ
import { FileInterceptor } from '@nestjs/platform-express';
import { multerAvatarConfig } from 'src/up-files/multer.config';
import { Role } from 'src/common/enums/enum.role';
import { Request } from 'express';
// import { RegisterDto } from '../auth/dto/register.dto';
// import { AuthService } from '../auth/auth.service';

@Controller('users')
@UseGuards(JwtAuthGuard)//, RolesGuard
// Bảo vệ tất cả routes bằng JWT + RolesGuard
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // @Post()
    // @Roles('admin') // chỉ admin tạo user
    // async create(@Body() dto: CreateUserDto) {
    //     return this.usersService.create(dto);
    // }
    @Post('admin-create')
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
    async register(@Body() dto: CreateUserDto, @UploadedFile() file?: Express.Multer.File) {
        return this.usersService.registerFromUsers(dto, file);
    }

    @Get()
    @Roles(Role.ADMIN) // chỉ admin xem tất cả
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.STAFF, Role.USER)  // type-safe, autocomplete ngon
    // admin xem bất kỳ; staff/user chỉ xem chính họ (RolesGuard check params.id === req.user.id)
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }
    //ép kiểu int ngay từ đầu
    // @Get(':id')
    // @Roles('admin', 'staff', 'user')
    // async findOne(@Param('id', ParseIntPipe) id: number) {
    //     return this.usersService.findOne(id);
    // }
    // Update me
    // @Patch('me')
    // @UseGuards(JwtAuthGuard)
    // async updateMe(@Body() dto: UpdateUserDto, @Req() req: any) {
    //     return this.usersService.update(req.user.id, dto, req.user.role, req.user.id);
    // }

    // Update any (admin only)
    // @Patch(':id')
    // @Roles(Role.ADMIN)
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // async updateAny(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    //     return this.usersService.update(id, dto, req.user.role, req.user.id);
    // }
    // Update me
    @Patch('me')
    @Roles(Role.ADMIN, Role.STAFF, Role.USER)
    // @UseGuards(JwtAuthGuard, RolesGuard)// check role
    @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
    async updateMe(
        @Body() dto: UpdateUserDto,
        @Req() req: Request & { user: JwtPayload },
        @UploadedFile() file?: Express.Multer.File,//bởi vì nó là có  thể có hoặc ko nên phải để dưới cùng
        // @Req() req: RequestWithUser,
    ) {
        return this.usersService.update(req.user.id, dto, req.user.role, req.user.id, file);
    }
    // Update any (admin) có ảnh ko
    @Patch(':id')
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
    async updateAny(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateUserDto,
        @Req() req: Request & { user: JwtPayload },  // extend type, hết highlight req.user
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.usersService.update(id, dto, req.user.role, req.user.id, file);
    }


    // Soft delete (admin only)
    @Delete(':id/soft')
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async softDelete(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.softDelete(id);
    }

    // Hard delete single (admin only)
    @Delete(':id/hard')
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async hardDelete(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.hardDelete(id);
    }

    // Hard delete multi (admin only)
    @Delete('multi/hard')
    @Roles(Role.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async hardDeleteMulti(@Body('ids') ids: string[]) {  // body { "ids": ["uuid1", "uuid2"] }
        return this.usersService.hardDeleteMulti(ids);
    }
}
