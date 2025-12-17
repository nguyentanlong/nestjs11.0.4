// import { Module } from '@nestjs/common';

// @Module({})
// export class UsersModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        // kết nối entity User với TypeORM
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class UsersModule { }
