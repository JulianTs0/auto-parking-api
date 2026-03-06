import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserWebServiceI } from '../../../domain/services/web/user-web-service.interface';

@ApiTags('users/web')
@Controller('web/users')
export class UserWebController {
    constructor(private readonly userWebService: UserWebServiceI) {}
}
