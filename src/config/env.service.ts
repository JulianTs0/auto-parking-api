import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService {
    constructor(private readonly configService: ConfigService) { }

    get dbHost(): string {
        return this.configService.getOrThrow<string>('DB_HOST');
    }

    get dbPort(): number {
        return parseInt(
            this.configService.getOrThrow<string>('DB_PORT'),
            10,
        );
    }

    get dbUsername(): string {
        return this.configService.getOrThrow<string>('DB_USERNAME');
    }

    get dbPassword(): string {
        return this.configService.getOrThrow<string>('DB_PASSWORD');
    }

    get dbName(): string {
        return this.configService.getOrThrow<string>('DB_DATABASE');
    }

    get jwtSecret(): string {
        return this.configService.getOrThrow<string>('JWT_SECRET');
    }

    get jwtExpiration(): number {
        return parseInt(
            this.configService.getOrThrow<string>('JWT_EXPIRATION'),
            10,
        );
    }

    get mailSender(): string {
        return this.configService.getOrThrow<string>('MAIL_SENDER');
    }

    get mailHost(): string {
        return this.configService.getOrThrow<string>('MAIL_HOST');
    }

    get mailPort(): number {
        return parseInt(
            this.configService.getOrThrow<string>('MAIL_PORT'),
            10,
        );
    }

    get mailUser(): string {
        return this.configService.getOrThrow<string>('MAIL_USER');
    }

    get mailPass(): number {
        return parseInt(
            this.configService.getOrThrow<string>('MAIL_PORT'),
            10,
        );
    }

    get isSync(): boolean {
        return this.configService.getOrThrow<string>('ENV') === 'dev';
    }
}
