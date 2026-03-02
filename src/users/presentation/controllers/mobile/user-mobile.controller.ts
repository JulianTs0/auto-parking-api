import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserMobileServiceI } from '../../../domain/services/mobile/user-mobile-service.interface';

@ApiTags('users/mobile')
@Controller('mobile/users')
export class UserMobileController {
    constructor(
        private readonly userMobileService: UserMobileServiceI,
    ) {}
}
