import { IsString, Matches } from 'class-validator';
export class UpdatePasswordDto {
  @IsString() currentPassword: string;

  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/, {
    message: 'New password must be 8-16 chars, 1 uppercase, 1 special character',
  })
  newPassword: string;
}