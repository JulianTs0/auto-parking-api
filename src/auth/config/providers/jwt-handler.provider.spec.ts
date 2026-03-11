import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { EnvConfigService } from 'src/config/env.service';
import { User } from 'src/commons';
import { JWTHandler, JwtPayload } from './jwt-handler.provider';

describe('JWTHandler', () => {
    let handler: JWTHandler;
    let jwtServiceMock: jest.Mocked<JwtService>;

    const mockSecret = 'super-secreto-123';
    const mockExpiration = 3600;

    beforeEach(async () => {
        const mockJwtService = {
            verifyAsync: jest.fn(),
            signAsync: jest.fn(),
        };

        const mockConfigService = {
            jwtSecret: mockSecret,
            jwtExpiration: mockExpiration,
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JWTHandler,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: EnvConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        handler = module.get<JWTHandler>(JWTHandler);
        jwtServiceMock = module.get(JwtService);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sanity check', () => {
        expect(handler).toBeDefined();
    });

    describe('createToken()', () => {
        it('should calculate expiration correctly and sign token', async () => {
            // Arrange
            //
            const mockUser = {
                id: 'user-123',
                email: 'test@test.com',
            } as User;
            const mockToken = 'header.payload.signature';

            jest.spyOn(Date, 'now').mockReturnValue(1000000);

            jwtServiceMock.signAsync.mockResolvedValue(mockToken);

            // Act
            const result = await handler.createToken(mockUser);

            // Assert - calculate expected expiration
            const expectedNow = 1000;
            const expectedExpiration = expectedNow + mockExpiration;

            // Assert - signAsync should be called with correct payload
            expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
                {
                    sub: mockUser.id,
                    email: mockUser.email,
                    iat: expectedNow,
                    exp: expectedExpiration,
                },
                {
                    secret: mockSecret,
                    algorithm: 'HS256',
                },
            );
            // Assert - should return token
            expect(result).toBe(mockToken);
        });
    });

    describe('verifyToken()', () => {
        it('should return true if token is valid', async () => {
            // Arrange
            jwtServiceMock.verifyAsync.mockResolvedValue(
                {} as JwtPayload,
            );

            // Act
            const result = await handler.verifyToken('token-valido');

            // Assert - should return true
            expect(result).toBe(true);
            // Assert - verifyAsync should be called
            expect(jwtServiceMock.verifyAsync).toHaveBeenCalled();
        });

        it('should return false if token is invalid or expired', async () => {
            // Arrange
            jwtServiceMock.verifyAsync.mockRejectedValue(
                new Error('Token Expired'),
            );

            // Act
            const result =
                await handler.verifyToken('token-invalido');

            // Assert - should return false
            expect(result).toBe(false);
        });
    });

    describe('getSubject()', () => {
        it('should return "sub" from decoded token', async () => {
            // Arrange
            const mockPayload: JwtPayload = {
                sub: 'user-123',
                email: '',
                iat: 0,
                exp: 0,
            };
            jwtServiceMock.verifyAsync.mockResolvedValue(mockPayload);

            // Act
            const result = await handler.getSubject('any-token');

            // Assert
            expect(result).toBe('user-123');
        });
    });

    describe('getExpirationDate()', () => {
        it('should transform "exp" into valid Date object', async () => {
            // Arrange
            const timestamp = 1700000000;
            const mockPayload: JwtPayload = {
                sub: '',
                email: '',
                iat: 0,
                exp: timestamp,
            };
            jwtServiceMock.verifyAsync.mockResolvedValue(mockPayload);

            // Act
            const result =
                await handler.getExpirationDate('any-token');

            // Assert - should return Date with timestamp multiplied by 1000
            expect(result).toEqual(new Date(timestamp * 1000));
        });
    });
});
