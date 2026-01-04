import * as Yup from 'yup';

/**
 * Returns a Yup validation schema for login, using the provided translation function for all messages.
 *
 * Translation keys used:
 *   - auth.invalidEmail
 *   - auth.emailRequired
 *   - auth.passwordRequired
 *
 * @param t - Translation function from react-i18next
 */
export const getLoginSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    email: Yup.string().email(t('auth.invalidEmail')).required(t('auth.emailRequired')),
    password: Yup.string().required(t('auth.passwordRequired')),
  });

export type LoginFormValues = {
  email: string;
  password: string;
}; 