import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  signupData: null,
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setSignupData(state, action) {
      state.signupData = action.payload;
    },
    clearSignupData(state) {
      state.signupData = null;
    },
  },
});

export const { setSignupData, clearSignupData } = signupSlice.actions;
export default signupSlice.reducer; 