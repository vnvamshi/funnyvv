import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

export const getSignupValidationSchema = (t: (key: string) => string) =>
  yup.object().shape({
    name: yup.string()
      .required(t('validation.name_required'))
      .min(3, t('validation.name_min'))
      .max(50, t('validation.name_max'))
      .matches(/^[A-Za-z ]+$/, t('validation.name_letters_spaces')),
    email: yup.string().email(t('validation.email_invalid')).required(t('validation.email_required')),
    mobile: yup.string().optional().nullable(),
    password: yup.string()
      .min(8, t('validation.password_min'))
      .required(t('validation.password_required'))
      .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/, t('validation.password_complex')),
    confirmPassword: yup.string().oneOf([yup.ref('password')], t('validation.confirm_password_match')).required(t('validation.confirm_password_match')),
    terms: yup.boolean().oneOf([true], t('validation.terms')).required(),
  }); 