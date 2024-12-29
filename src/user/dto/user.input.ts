import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto implements Omit<Prisma.UserCreateInput, 'role'> {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  avatar?: string | null | undefined;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
