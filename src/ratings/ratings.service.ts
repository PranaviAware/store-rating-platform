import {
  Injectable, NotFoundException, ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating) private ratingsRepo: Repository<Rating>,
  ) {}

  async create(userId: string, dto: CreateRatingDto) {
    const existing = await this.ratingsRepo.findOne({
      where: { userId, storeId: dto.storeId },
    });
    if (existing) throw new ConflictException('You have already rated this store. Use update instead.');

    const rating = this.ratingsRepo.create({ ...dto, userId });
    return this.ratingsRepo.save(rating);
  }

  async update(ratingId: string, userId: string, value: number) {
    const rating = await this.ratingsRepo.findOne({ where: { id: ratingId } });
    if (!rating) throw new NotFoundException('Rating not found');
    if (rating.userId !== userId) throw new ForbiddenException('Not your rating');
    rating.value = value;
    return this.ratingsRepo.save(rating);
  }

  async getStoreRatings(storeId: string) {
    return this.ratingsRepo.find({
      where: { storeId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageForStore(storeId: string) {
    const result = await this.ratingsRepo
      .createQueryBuilder('r')
      .select('AVG(r.value)', 'avg')
      .addSelect('COUNT(r.id)', 'count')
      .where('r.storeId = :storeId', { storeId })
      .getRawOne();
    return {
      average: parseFloat(parseFloat(result.avg || '0').toFixed(2)),
      count: parseInt(result.count || '0'),
    };
  }

  async getTotalCount() {
    return this.ratingsRepo.count();
  }

  async getOwnerDashboard(ownerId: string) {
  const store = await this.ratingsRepo.manager
    .getRepository('Store')
    .findOne({ where: { ownerId } });

  if (!store) return { ratings: [], averageRating: 0, storeName: '' };

  const ratings = await this.ratingsRepo
    .createQueryBuilder('rating')
    .innerJoin('rating.store', 'store')
    .innerJoin('rating.user', 'user')
    .where('store.ownerId = :ownerId', { ownerId })
    .select([
      'rating.id AS id',
      'rating.value AS value',
      'rating.createdAt AS "createdAt"',
      'user.id AS "userId"',
      'user.name AS "userName"',
      'user.email AS "userEmail"',
      'store.name AS "storeName"',
    ])
    .getRawMany();

  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + Number(r.value), 0) / ratings.length
      : 0;

  return {
    ratings,
    averageRating: parseFloat(avg.toFixed(2)),
    storeName: store ? (store as any).name : '',
  };
}
}