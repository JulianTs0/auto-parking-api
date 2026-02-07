import { Injectable } from '@nestjs/common';
import { UserMobileServiceI } from './user-mobile-service.interface';

@Injectable()
export class UserMobileService implements UserMobileServiceI { }
