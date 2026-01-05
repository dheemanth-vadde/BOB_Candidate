import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  authUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setAuthUser(state, action) {
      state.authUser = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.authUser = null;
    },

    // ✅ ADD THIS
    markProfileCompleted(state) {
      if (!state.user?.data?.user) return;

      state.user.data.user.isProfileCompleted = true;

      // 🔥 IMPORTANT: currentStep is meaningless after completion
      state.user.data.user.currentStep = null;
    },
  },
});

export const {
  setUser,
  setAuthUser,
  clearUser,
  markProfileCompleted
} = userSlice.actions;

export default userSlice.reducer;
