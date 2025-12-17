import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
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
// import { RegisterDto } from '../auth/dto/register.dto';
// import { AuthService } from '../auth/auth.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
// Bảo vệ tất cả routes bằng JWT + RolesGuard
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // @Post()
    // @Roles('admin') // chỉ admin tạo user
    // async create(@Body() dto: CreateUserDto) {
    //     return this.usersService.create(dto);
    // }
    @Post('admin-create')
    @Roles('admin')
    @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
    async register(@Body() dto: CreateUserDto, @UploadedFile() file?: Express.Multer.File) {
        return this.usersService.registerFromUsers(dto, file);
    }

    @Get()
    @Roles('admin') // chỉ admin xem tất cả
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles('admin', 'staff', 'user')
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

    /* @Put(':id')
     @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))//trên client phải giống avatar
     @Roles('admin', 'staff', 'user')
     async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
         return this.usersService.update(id, dto);
     }
 
     @Delete(':id')
     @Roles('admin', 'staff', 'user')
     async remove(@Param('id') id: string) {
         return this.usersService.remove(id);
     }*/
}
