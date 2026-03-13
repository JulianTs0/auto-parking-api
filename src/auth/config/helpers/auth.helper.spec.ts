import { Test, TestingModule } from '@nestjs/testing';
import { AuthHelper } from './auth.helper'; // Ajustá la ruta
import { PasswordEncoderI } from '../providers/password-encoder.interface';
import { TokenHandlerI } from '../providers/token-handler.interface';
import { Token, User } from 'src/commons';

describe('AuthHelper', () => {
    let helper: AuthHelper;
    let passwordEncoderMock: jest.Mocked<PasswordEncoderI>;
    let tokenHandlerMock: jest.Mocked<TokenHandlerI>;

    beforeEach(async () => {
        const mockPasswordEncoder = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const mockTokenHandler = {
            verifyToken: jest.fn(),
            createToken: jest.fn(),
            getSubject: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthHelper,
                {
                    provide: PasswordEncoderI,
                    useValue: mockPasswordEncoder,
                },
                {
                    provide: TokenHandlerI,
                    useValue: mockTokenHandler,
                },
            ],
        }).compile();

        helper = module.get<AuthHelper>(AuthHelper);
        passwordEncoderMock = module.get(PasswordEncoderI);
        tokenHandlerMock = module.get(TokenHandlerI);

        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(helper).toBeDefined();
    });

    describe('hashPassword()', () => {
        it('should delegate hashing to passwordEncoder', async () => {
            // Arrange
            const password = 'mi-password';
            passwordEncoderMock.hash.mockResolvedValue(
                'hashed-password',
            );

            // Act
            const result = await helper.hashPassword(password);

            // Assert - hash should be called with password
            expect(passwordEncoderMock.hash).toHaveBeenCalledWith(
                password,
            );
            // Assert - should return hashed password
            expect(result).toBe('hashed-password');
        });
    });

    describe('validatePassword()', () => {
        it.each([
            { mockReturn: true, expected: true },
            { mockReturn: false, expected: false },
        ])(
            'should return $expected if encoder returns $mockReturn',
            async ({ mockReturn, expected }) => {
                // Arrange
                const mockUser = {
                    passwordHash: 'hash-guardado',
                } as User;
                const plainPassword = 'password-intento';

                passwordEncoderMock.compare.mockResolvedValue(
                    mockReturn,
                );

                // Act
                const result = await helper.validatePassword(
                    mockUser,
                    plainPassword,
                );

                // Assert - compare should be called with correct params
                expect(
                    passwordEncoderMock.compare,
                ).toHaveBeenCalledWith(
                    plainPassword,
                    mockUser.passwordHash,
                );
                // Assert - should return expected result
                expect(result).toBe(expected);
            },
        );
    });

    describe('parseToken()', () => {
        it('should return null if tokenContainer is empty', async () => {
            // Arrange & Act
            const result = await helper.parseToken('');

            // Assert - should return null
            expect(result).toBeNull();
            // Assert - verifyToken should not be called
            expect(
                tokenHandlerMock.verifyToken,
            ).not.toHaveBeenCalled();
        });

        it('should return null if not from URL and does not start with "Bearer "', async () => {
            // Arrange & Act
            const result = await helper.parseToken(
                'TokenInvalidoSinPrefijo',
                false,
            );

            // Assert - should return null
            expect(result).toBeNull();
            // Assert - verifyToken should not be called
            expect(
                tokenHandlerMock.verifyToken,
            ).not.toHaveBeenCalled();
        });

        it('should return null if Bearer token but verification fails', async () => {
            // Arrange
            tokenHandlerMock.verifyToken.mockResolvedValue(false);

            // Act
            const result = await helper.parseToken(
                'Bearer token-falso',
                false,
            );

            // Assert - verifyToken should be called with clean token
            expect(tokenHandlerMock.verifyToken).toHaveBeenCalledWith(
                'token-falso',
            );
            // Assert - should return null
            expect(result).toBeNull();
        });

        it('should return clean token if Bearer is valid', async () => {
            // Arrange
            tokenHandlerMock.verifyToken.mockResolvedValue(true);

            // Act
            const result = await helper.parseToken(
                'Bearer token-real-123',
                false,
            );

            // Assert - verifyToken should be called with clean token
            expect(tokenHandlerMock.verifyToken).toHaveBeenCalledWith(
                'token-real-123',
            );
            // Assert - should return clean token
            expect(result).toBe('token-real-123');
        });

        it('should return token as-is if from URL and is valid', async () => {
            // Arrange
            tokenHandlerMock.verifyToken.mockResolvedValue(true);

            // Act
            const result = await helper.parseToken(
                'token-de-url-xyz',
                true,
            );

            // Assert - verifyToken should be called with token
            expect(tokenHandlerMock.verifyToken).toHaveBeenCalledWith(
                'token-de-url-xyz',
            );
            // Assert - should return token as-is
            expect(result).toBe('token-de-url-xyz');
        });
    });

    describe('createToken()', () => {
        it('should instantiate Token and assign generated accessToken', async () => {
            // Arrange
            const mockUser = { id: '1' } as User;
            const mockJwtStr = 'header.payload.signature';

            tokenHandlerMock.createToken.mockResolvedValue(
                mockJwtStr,
            );

            // Act
            const result = await helper.createToken(mockUser);

            // Assert - createToken should be called with user
            expect(tokenHandlerMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            // Assert - should be instance of Token
            expect(result).toBeInstanceOf(Token);
            // Assert - should have correct accessToken
            expect(result.accessToken).toBe(mockJwtStr);
        });
    });

    describe('getSubject()', () => {
        it('should delegate to tokenHandler and return subject', async () => {
            // Arrange
            tokenHandlerMock.getSubject.mockResolvedValue(
                'user-uuid-123',
            );

            // Act
            const result = await helper.getSubject('un-token');

            // Assert - getSubject should be called with token
            expect(tokenHandlerMock.getSubject).toHaveBeenCalledWith(
                'un-token',
            );
            // Assert - should return subject
            expect(result).toBe('user-uuid-123');
        });
    });
});
