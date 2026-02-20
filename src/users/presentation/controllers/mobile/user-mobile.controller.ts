import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserMobileServiceI } from 'src/users/domain';

@ApiTags('users/mobile')
@Controller('mobile/users')
export class UserMobileController {
    constructor(
        private readonly userMobileService: UserMobileServiceI,
    ) {}
}
