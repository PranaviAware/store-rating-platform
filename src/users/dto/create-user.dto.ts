import { IsEmail, IsEnum, IsString, Length, Matches, MaxLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @Length(20, 60, { message: 'Name must be 20 to 60 characters' })
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(400)
  address: string;

  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/, {
    message: 'Password must be 8-16 chars, 1 uppercase, 1 special character',
  })
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}