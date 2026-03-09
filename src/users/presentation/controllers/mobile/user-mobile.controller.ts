import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users/mobile')
@Controller('mobile/users')
export class UserMobileController {}
