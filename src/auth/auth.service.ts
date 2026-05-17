import {
  Injectable, UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const passwordMatch = bcrypt.compareSync(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid email or password');

    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    const { password, ...userWithoutPassword } = user;
    return { access_token: token, user: userWithoutPassword };
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashed = bcrypt.hashSync(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashed,
      role: UserRole.USER,
    });

    const { password, ...userWithoutPassword } = user;
    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { access_token: token, user: userWithoutPassword };
  }
}