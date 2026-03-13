import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt'; // Importamos la librería real
import { BcryptEncoder } from './bcrypt-encoder.provider';

jest.mock('bcrypt', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
}));

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
        it('should generate salt with 12 rounds and hash password', async () => {
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

            // Assert - genSalt should be called with 12 rounds
            expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
            // Assert - hash should be called with password and salt
            expect(bcrypt.hash).toHaveBeenCalledWith(
                plainPassword,
                mockGeneratedSalt,
            );
            // Assert - should return the final hash
            expect(result).toBe(mockFinalHash);
        });
    });

    describe('compare()', () => {
        it('should delegate comparison to bcrypt', async () => {
            // Arrange
            const plainPassword = 'mi_password_secreto';
            const encryptedHash = 'hash_final_abc';

            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await encoder.compare(
                plainPassword,
                encryptedHash,
            );

            // Assert - compare should be called with correct params
            expect(bcrypt.compare).toHaveBeenCalledWith(
                plainPassword,
                encryptedHash,
            );
            // Assert - should return true
            expect(result).toBe(true);
        });
    });
});
