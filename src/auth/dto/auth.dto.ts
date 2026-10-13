import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_MIN = 6;
const PASSWORD_MAX = 72;

export class RegisterDto {
  /** @example 'Sara Ahmed' */
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  /** @example 'sara@example.com' */
  @IsEmail()
  email!: string;

  /**
   * International format including country code.
   * @example '+966501234567'
   */
  @Matches(/^\+?[1-9]\d{6,14}$/, {
    message:
      'phone must be a valid international number including country code, e.g. +966501234567',
  })
  phone!: string;

  /** @example 'secret123' */
  @IsString()
  @MinLength(PASSWORD_MIN)
  @MaxLength(PASSWORD_MAX)
  password!: string;
}

export class EmailDto {
  /** @example 'sara@example.com' */
  @IsEmail()
  email!: string;
}

export class VerifyRegistrationDto extends EmailDto {
  /** @example '482913' */
  @Matches(/^\d{4,10}$/, { message: 'otp must be numeric' })
  otp!: string;
}

export class IdentityDto {
  /**
   * Email address or phone number with country code.
   * @example 'sara@example.com'
   */
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}

export class LoginDto extends IdentityDto {
  /** @example 'secret123' */
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class VerifyPasswordResetOtpDto extends IdentityDto {
  /** @example '482913' */
  @Matches(/^\d{4,10}$/, { message: 'otp must be numeric' })
  otp!: string;
}

export class ResetPasswordDto {
  /** Token returned by `POST /auth/password/verify-otp`. */
  @IsString()
  @IsNotEmpty()
  resetToken!: string;

  /** @example 'newSecret123' */
  @IsString()
  @MinLength(PASSWORD_MIN)
  @MaxLength(PASSWORD_MAX)
  password!: string;
}

export class ChangePasswordDto {
  /** @example 'secret123' */
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  /** @example 'newSecret123' */
  @IsString()
  @MinLength(PASSWORD_MIN)
  @MaxLength(PASSWORD_MAX)
  newPassword!: string;
}
