import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateUserDto } from './dto/user.input';
import { hashSync } from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findOne(email: string) {
    try {
      return this.prisma.user.findUniqueOrThrow({ where: { email } });
    } catch {
      throw new NotFoundException();
    }
  }

  findOneById(id: number) {
    try {
      return this.prisma.user.findUniqueOrThrow({ where: { id } });
    } catch {
      throw new NotFoundException();
    }
  }

  create(data: CreateUserDto) {
    const hashPassword = hashSync(data.password);
    data.password = hashPassword;
    return this.prisma.user.create({ data });
  }
}
