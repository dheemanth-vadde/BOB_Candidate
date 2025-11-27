import { createSlice } from "@reduxjs/toolkit";

const digilockerSlice = createSlice({
  name: "digilocker",
  initialState: {
    connected: false,
    accessToken: null
  },
  reducers: {
    setDigiLockerConnected(state, action) {
      state.connected = action.payload;
    },
    setDigiLockerAccessToken(state, action) {
      state.accessToken = action.payload;  // <— ONLY THIS STORED
    },
    resetDigiLocker(state) {
      state.connected = false;
      state.accessToken = null;
    }
  }
});

export const {
  setDigiLockerConnected,
  setDigiLockerAccessToken,
  resetDigiLocker
} = digilockerSlice.actions;

export default digilockerSlice.reducer;
