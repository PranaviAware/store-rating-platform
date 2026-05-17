import {
  Controller, Get, Post, Patch, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/user.entity';

@Controller('ratings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @Roles(UserRole.USER)
  create(@CurrentUser() user: any, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(user.id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.USER)
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('value') value: number,
  ) {
    return this.ratingsService.update(id, user.id, value);
  }

  @Get('owner/dashboard')
  @Roles(UserRole.STORE_OWNER)
  ownerDashboard(@CurrentUser() user: any) {
    return this.ratingsService.getOwnerDashboard(user.id);
  }
}