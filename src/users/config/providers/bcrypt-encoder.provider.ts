import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordEncoderI } from './password-encoder.interface';

@Injectable()
export class BcryptEncoder implements PasswordEncoderI {
    private readonly saltRounds = 12;

    public async hash(data: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.saltRounds);
        return bcrypt.hash(data, salt);
    }
}
