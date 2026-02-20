import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserWebServiceI } from 'src/users/domain';

@ApiTags('users/web')
@Controller('web/users')
export class UserWebController {
    constructor(private readonly userWebService: UserWebServiceI) {}
}
