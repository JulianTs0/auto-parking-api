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
        it('debería delegar el hasheo al passwordEncoder', async () => {
            // Arrange
            const password = 'mi-password';
            passwordEncoderMock.hash.mockResolvedValue(
                'hashed-password',
            );

            // Act
            const result = await helper.hashPassword(password);

            // Assert
            expect(passwordEncoderMock.hash).toHaveBeenCalledWith(
                password,
            );
            expect(result).toBe('hashed-password');
        });
    });

    describe('validatePassword()', () => {
        it.each([
            { mockReturn: true, expected: true },
            { mockReturn: false, expected: false },
        ])(
            'debería devolver $expected si el encoder retorna $mockReturn',
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

                // Assert
                expect(
                    passwordEncoderMock.compare,
                ).toHaveBeenCalledWith(
                    plainPassword,
                    mockUser.passwordHash,
                );
                expect(result).toBe(expected);
            },
        );
    });

    describe('parseToken()', () => {
        it('debería retornar null si el tokenContainer está vacío', async () => {
            // Arrange & Act
            const result = await helper.parseToken('');

            // Assert
            expect(result).toBeNull();
            expect(
                tokenHandlerMock.verifyToken,
            ).not.toHaveBeenCalled();
        });

        it('debería retornar null si no viene por URL y no empieza con "Bearer "', async () => {
            // Arrange & Act
            const result = await helper.parseToken(
                'TokenInvalidoSinPrefijo',
                false,
            );

            // Assert
            expect(result).toBeNull();
            expect(
                tokenHandlerMock.verifyToken,
            ).not.toHaveBeenCalled();
        });

        it('debería retornar null si es un Bearer token pero la verificación falla', async () => {
            // Arrange
            tokenHandlerMock.verifyToken.mockResolvedValue(false);

            // Act
            const result = await helper.parseToken(
                'Bearer token-falso',
                false,
            );

            // Assert
            expect(tokenHandlerMock.verifyToken).toHaveBeenCalledWith(
                'token-falso',
            );
            expect(result).toBeNull();
        });

        it('debería retornar el token limpio si es un Bearer válido', async () => {
            // Arrange
            tokenHandlerMock.verifyToken.mockResolvedValue(true);

            // Act
            const result = await helper.parseToken(
                'Bearer token-real-123',
                false,
            );

            // Assert
            expect(tokenHandlerMock.verifyToken).toHaveBeenCalledWith(
                'token-real-123',
            );
            expect(result).toBe('token-real-123');
        });

        it('debería retornar el token tal cual si viene por URL y es válido', async () => {
            // Arrange
            tokenHandlerMock.verifyToken.mockResolvedValue(true);

            // Act
            const result = await helper.parseToken(
                'token-de-url-xyz',
                true,
            );

            // Assert
            expect(tokenHandlerMock.verifyToken).toHaveBeenCalledWith(
                'token-de-url-xyz',
            );
            expect(result).toBe('token-de-url-xyz');
        });
    });

    describe('createToken()', () => {
        it('debería instanciar un Token y asignarle el accessToken generado', async () => {
            // Arrange
            const mockUser = { id: '1' } as User;
            const mockJwtStr = 'header.payload.signature';

            tokenHandlerMock.createToken.mockResolvedValue(
                mockJwtStr,
            );

            // Act
            const result = await helper.createToken(mockUser);

            // Assert
            expect(tokenHandlerMock.createToken).toHaveBeenCalledWith(
                mockUser,
            );
            expect(result).toBeInstanceOf(Token);
            expect(result.accessToken).toBe(mockJwtStr);
        });
    });

    describe('getSubject()', () => {
        it('debería delegar al tokenHandler y retornar el subject', async () => {
            // Arrange
            tokenHandlerMock.getSubject.mockResolvedValue(
                'user-uuid-123',
            );

            // Act
            const result = await helper.getSubject('un-token');

            // Arrange
            expect(tokenHandlerMock.getSubject).toHaveBeenCalledWith(
                'un-token',
            );
            expect(result).toBe('user-uuid-123');
        });
    });
});
