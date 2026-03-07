import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt'; // Importamos la librería real
import { BcryptEncoder } from './bcrypt-encoder.provider';

jest.mock('bcrypt');

describe('BcryptEncoder', () => {
    let encoder: BcryptEncoder;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BcryptEncoder],
        }).compile();

        encoder = module.get<BcryptEncoder>(BcryptEncoder);
        jest.clearAllMocks();
    });

    it('sanity check', () => {
        expect(encoder).toBeDefined();
    });

    describe('hash()', () => {
        it('debería generar un salt con 12 rondas y hashear la contraseña', async () => {
            // Arrange
            const plainPassword = 'mi_password_secreto';

            const mockGeneratedSalt = 'salt_falso_123';
            const mockFinalHash = 'hash_final_abc';

            (bcrypt.genSalt as jest.Mock).mockResolvedValue(
                mockGeneratedSalt,
            );
            (bcrypt.hash as jest.Mock).mockResolvedValue(
                mockFinalHash,
            );

            // Act
            const result = await encoder.hash(plainPassword);

            // Assert
            expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
            expect(bcrypt.hash).toHaveBeenCalledWith(
                plainPassword,
                mockGeneratedSalt,
            );
            expect(result).toBe(mockFinalHash);
        });
    });

    describe('compare()', () => {
        it('debería delegar la comparación a bcrypt', async () => {
            // Arrange
            const plainPassword = 'mi_password_secreto';
            const encryptedHash = 'hash_final_abc';

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await encoder.compare(
                plainPassword,
                encryptedHash,
            );

            // Assert
            expect(bcrypt.compare).toHaveBeenCalledWith(
                plainPassword,
                encryptedHash,
            );
            expect(result).toBe(true);
        });
    });
});
