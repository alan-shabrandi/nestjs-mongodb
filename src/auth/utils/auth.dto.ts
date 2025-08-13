import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

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

export class RefreshDto {
  @ApiProperty({
    description: 'The ID of the user requesting a new access token',
    example: '64d3e8f4a9c123456789abcd',
  })
  userId: string;

  @ApiProperty({
    description: 'The refresh token previously issued to the user',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
