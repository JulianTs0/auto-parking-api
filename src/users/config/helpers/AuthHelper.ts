import { Injectable } from '@nestjs/common';
import { PasswordEncoderI } from '../providers/PasswordEncoderI';
import { TokenHandlerI } from '../providers/TokenHandlerI';

@Injectable()
export class AuthHelper {
    constructor(
        private readonly passwordEncoder: PasswordEncoderI,
        private readonly tokenHandler: TokenHandlerI,
    ) { }
}
