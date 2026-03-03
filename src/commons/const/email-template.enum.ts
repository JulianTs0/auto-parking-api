export enum EmailFiles {
    DEFAULT = 'template.html',
}

export enum Subjects {
    EMAIL_VALIDATION = 'Validacion de mail',
    OWNER_REQUEST = 'Peticion de acceso al sistema',
}

export interface EmailTemplate {
    title: string;
    message: string;
    buttonText: string;
    defaultLink: string;
}

export const EmailTemplates: Record<string, EmailTemplate> = {
    VERIFY: {
        title: 'Verifica tu correo',
        message:
            'Haz clic en el botón de abajo para verificar tu cuenta.',
        buttonText: 'Verificar mi correo',
        defaultLink: 'https://autoparking.com/login',
    },
    OWNER_REQUEST: {
        title: 'Creacion de un nuevo dueño de parking',
        message:
            'Haz clic en el botón de abajo para validar el registro',
        buttonText: 'Aceptar registro',
        defaultLink: 'https://autoparking.com/login',
    },
    EMPLOYEE_VERIFY: {
        title: 'Registro de empleado',
        message:
            'Su empleador se comunico con el sistema y quiere que se una a trabajar con el en el parking\n Los datos del empleador son:\n ',
        buttonText: 'Suscribirme como empleado',
        defaultLink: 'https://autoparking.com/login',
    },
    RECOVER: {
        title: 'Recuperar contraseña',
        message:
            'Hemos recibido una solicitud para cambiar tu contraseña. Haz clic abajo para continuar.',
        buttonText: 'Cambiar contraseña',
        defaultLink: 'https://autoparking.com/login',
    },
} as const;

export type EmailTemplates = keyof typeof EmailTemplates;
