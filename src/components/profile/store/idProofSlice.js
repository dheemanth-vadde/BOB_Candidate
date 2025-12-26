import { createSlice } from '@reduxjs/toolkit';

const idProofSlice = createSlice({
  name: 'idProof',
  initialState: {
    name: '',
    dob: '',
  },
  reducers: {
    setExtractedData: (state, action) => {
      state.name = action.payload.name;
      state.dob = action.payload.dob;
    },
    clearExtractedData: (state) => {
      state.name = '';
      state.dob = '';
    },
  },
});

export const { setExtractedData, clearExtractedData } = idProofSlice.actions;
export default idProofSlice.reducer;