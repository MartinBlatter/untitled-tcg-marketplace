import * as yup from 'yup';

/**
 * Shared between the forms and the server actions, so the browser and the
 * server never disagree about what counts as valid. The client copy is a
 * convenience; the server copy is the one that matters.
 */

export const PASSWORD_MIN_LENGTH = 10;

export const emailSchema = yup
    .string()
    .trim()
    .lowercase()
    .email('auth.errors.emailInvalid')
    .max(255, 'auth.errors.emailTooLong')
    .required('auth.errors.required');

/**
 * Length over character classes: a long passphrase beats a short one with a
 * digit and a symbol bolted on, and composition rules mostly teach people to
 * write "Password1!".
 */
export const passwordSchema = yup
    .string()
    .min(PASSWORD_MIN_LENGTH, 'auth.errors.passwordTooShort')
    .max(200, 'auth.errors.passwordTooLong')
    .required('auth.errors.required');

export const loginSchema = yup.object({
    email: emailSchema,
    password: yup.string().required('auth.errors.required'),
});

export const registerSchema = yup.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'auth.errors.passwordMismatch')
        .required('auth.errors.required'),
});

export type LoginInput = yup.InferType<typeof loginSchema>;
export type RegisterInput = yup.InferType<typeof registerSchema>;
