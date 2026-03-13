import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users/web')
@Controller('web/users')
export class UserWebController {}
