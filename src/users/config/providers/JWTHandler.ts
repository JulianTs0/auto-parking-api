import { Injectable } from '@nestjs/common';
import {
    JsonWebTokenError,
    JwtService,
    TokenExpiredError,
} from '@nestjs/jwt';
import { TokenHandlerI } from './TokenHandlerI';
import { User } from 'src/commons';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}

@Injectable()
export class JWTHandler implements TokenHandlerI {
    private readonly secret: string;

    private readonly expirationSecconds: number;

    constructor(
        private readonly jwtService: JwtService,

        private readonly configService: ConfigService,
    ) {
        this.secret =
            this.configService.getOrThrow<string>('JWT_SECRET');
        this.expirationSecconds = parseInt(
            this.configService.getOrThrow<string>('JWT_EXPIRATION'),
            10,
        );
    }

    private async parseToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verifyAsync<JwtPayload>(token, {
            secret: this.secret,
            algorithms: ['HS256'],
        });
    }

    public async createToken(user: User): Promise<string> {
        const now = Math.floor(Date.now() / 1000);
        const expiration = now + this.expirationSecconds;

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            iat: now,
            exp: expiration,
        };

        return this.jwtService.signAsync(payload, {
            secret: this.secret,
            algorithm: 'HS256',
        });
    }

    public async verifyToken(token: string): Promise<boolean> {
        try {
            await this.parseToken(token);
            return true;
        } catch (e) {
            return false;
        }
    }

    public async getSubject(token: string): Promise<string> {
        const payload: JwtPayload = await this.parseToken(token);
        return payload.sub;
    }

    public async getExpirationDate(token: string): Promise<Date> {
        const payload: JwtPayload = await this.parseToken(token);
        return new Date(payload.exp * 1000);
    }
}
