import { IsInt, IsUUID, Max, Min } from 'class-validator';
export class CreateRatingDto {
  @IsInt() @Min(1) @Max(5)
  value: number;

  @IsUUID()
  storeId: string;
}