import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { FirebaseAuthGuard } from '../../core/guards/firebase-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { UserRole } from '../../shared/constants/enums';
import { CreateSponsorDto, UpdateSponsorDto } from './dto/sponsors.dto';

@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Get()
  async findAll() {
    return this.sponsorsService.findAllActive();
  }

  @Get('all')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllAdmin() {
    return this.sponsorsService.findAll();
  }

  @Post()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateSponsorDto) {
    return this.sponsorsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSponsorDto,
  ) {
    return this.sponsorsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.sponsorsService.remove(id);
    return { deleted: true };
  }
}
