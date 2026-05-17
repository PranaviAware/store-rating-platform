import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { StoresModule } from '../stores/stores.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [UsersModule, StoresModule, RatingsModule],
  controllers: [AdminController],
})
export class AdminModule {}