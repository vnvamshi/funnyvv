import * as yup from 'yup';

export const otpValidationSchema = yup.object().shape({
  otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
}); 