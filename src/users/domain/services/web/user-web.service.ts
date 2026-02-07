import { Injectable } from '@nestjs/common';
import { UserWebServiceI } from './user-web-service.interface';

@Injectable()
export class UserWebService implements UserWebServiceI { }
