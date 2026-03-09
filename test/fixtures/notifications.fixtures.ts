import { Token } from '../../src/commons/dto/token.dto';
import { SendVerifyMailReq } from '../../src/notifications/domain/dto/email/request/send-mail.request.dto';
import { SendRecoverMailReq } from '../../src/notifications/domain/dto/email/request/send-recover-mail.request.dto';
import { SendEmployeeRegistrationMailReq } from '../../src/notifications/domain/dto/email/request/send-employee-registration-mail.request.dto';

export const createTokenFixture = (overrides = {}) =>
    new Token({
        accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        ...overrides,
    });

export const createSendVerifyMailReqFixture = (overrides = {}) =>
    new SendVerifyMailReq({
        to: 'user@example.com',
        subject: 'Verifica tu correo electrónico',
        token: createTokenFixture(),
        ...overrides,
    });

export const createSendRecoverMailReqFixture = (overrides = {}) =>
    new SendRecoverMailReq({
        to: 'user@example.com',
        subject: 'Recuperación de contraseña',
        token: createTokenFixture(),
        ...overrides,
    });

export const createSendEmployeeRegistrationMailReqFixture = (
    overrides = {},
) =>
    new SendEmployeeRegistrationMailReq({
        to: 'employee@example.com',
        subject: 'Bienvenido al equipo',
        token: createTokenFixture(),
        ownerEmail: 'owner@example.com',
        ownerFullName: 'Juan Perez',
        ...overrides,
    });
