import {
  Injectable, NotFoundException, ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async create(dto: Partial<User>): Promise<User> {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findAll(filters: {
    name?: string; email?: string; address?: string; role?: UserRole;
    sortBy?: string; sortOrder?: 'ASC' | 'DESC';
  }) {
    const where: any = {};
    if (filters.name) where.name = ILike(`%${filters.name}%`);
    if (filters.email) where.email = ILike(`%${filters.email}%`);
    if (filters.address) where.address = ILike(`%${filters.address}%`);
    if (filters.role) where.role = filters.role;

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';

    return this.usersRepo.find({
      where,
      order: { [sortBy]: sortOrder },
      select: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const matches = bcrypt.compareSync(dto.currentPassword, user.password);
    if (!matches) throw new UnauthorizedException('Current password is incorrect');

    user.password = bcrypt.hashSync(dto.newPassword, 10);
    await this.usersRepo.save(user);
    return { message: 'Password updated successfully' };
  }

  async getStats() {
    return this.usersRepo.count();
  }

  async createAdminUser(dto: CreateUserDto) {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
    dto.password = bcrypt.hashSync(dto.password, 10);
    return this.create(dto);
  }
}