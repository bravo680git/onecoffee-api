import { Injectable } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateUserDto } from './dto/user.input';
import { $Enums } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findOne(email: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { email } });
  }

  findOneById(id: number) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: CreateUserDto, role: $Enums.UserRole) {
    const hashPassword = hashSync(data.password);
    data.password = hashPassword;
    return this.prisma.user.create({ data: { ...data, role } });
  }
}
