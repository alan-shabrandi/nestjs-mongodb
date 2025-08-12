import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    minLength: 3,
    example: 'Alan Shabrandi',
  })
  @IsNotEmpty()
  @MinLength(3)
  fullName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'alan@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password with minimum length of 8 characters',
    minLength: 8,
    example: 'strongPassword123',
  })
  @MinLength(8)
  password: string;
}

export class LoginUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'alan@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'strongPassword123',
  })
  @IsNotEmpty()
  password: string;
}

export class GetUserDto {
  @ApiPropertyOptional({
    description: 'User role to filter',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Search keyword for filtering users',
    example: 'alan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of users per page',
    minimum: 1,
    maximum: 50,
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50, { message: 'Limit cannot be greater than 50' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Order of sorting',
    enum: ['asc', 'desc'],
    example: 'asc',
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    description: 'Fields to include in response',
    example: 'email,fullName',
  })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({
    description: 'Include deleted users',
    example: 'true',
  })
  @IsOptional()
  @IsString()
  includeDeleted?: string;
}
