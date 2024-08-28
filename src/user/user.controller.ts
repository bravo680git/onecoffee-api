import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('admin/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
