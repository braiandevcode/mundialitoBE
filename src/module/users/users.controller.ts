import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseAuthGuard } from '../../core/guards/firebase-auth.guard';
import { CurrentUser } from '../../core/decorators/current-user.decorator';
import { Roles } from '../../core/decorators/roles.decorator';
import { RolesGuard } from '../../core/guards/roles.guard';
import { UserRole } from '../../shared/constants/enums';
import type { IUser } from '../../shared/contracts/entities';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: IUser) {
    return this.usersService.findByUid(user.id);
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: IUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':uid')
  async findByUid(@Param('uid') uid: string) {
    return this.usersService.findByUid(uid);
  }
}
