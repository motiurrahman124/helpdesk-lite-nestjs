import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  /** @example 'Sara Ahmed' */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  /** @example '+966501234567' */
  @IsOptional()
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message:
      'phone must be a valid international number including country code, e.g. +966501234567',
  })
  phone?: string;

  /** @example 'https://example.com/avatar.png' */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  profileImage?: string;
}
