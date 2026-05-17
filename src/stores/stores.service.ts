import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private storesRepo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storesRepo.create(dto);
    return this.storesRepo.save(store);
  }

  async findAll(filters: {
    name?: string; address?: string;
    sortBy?: string; sortOrder?: 'ASC' | 'DESC';
  }, userId?: string) {
    const where: any = {};
    if (filters.name) where.name = ILike(`%${filters.name}%`);
    if (filters.address) where.address = ILike(`%${filters.address}%`);

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';

    const stores = await this.storesRepo.find({
      where,
      order: { [sortBy]: sortOrder },
      relations: ['ratings'],
    });

    return stores.map((store) => {
      const avg =
        store.ratings.length > 0
          ? store.ratings.reduce((s, r) => s + r.value, 0) / store.ratings.length
          : 0;
      const userRating = userId
        ? store.ratings.find((r) => r.userId === userId)
        : null;
      return {
        ...store,
        averageRating: parseFloat(avg.toFixed(2)),
        totalRatings: store.ratings.length,
        userRating: userRating ? userRating.value : null,
        userRatingId: userRating ? userRating.id : null,
        ratings: undefined, // hide raw ratings array
      };
    });
  }

  async findById(id: string) {
    const store = await this.storesRepo.findOne({
      where: { id },
      relations: ['ratings', 'ratings.user'],
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async getCount() {
    return this.storesRepo.count();
  }
}