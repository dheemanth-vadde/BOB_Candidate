import { createSlice } from '@reduxjs/toolkit';

const experienceSlice = createSlice({
  name: 'experience',
  initialState: {
    parsed: null,
  },
  reducers: {
    setParsedExperience: (state, action) => {
      state.parsed = action.payload;
    },
    clearParsedExperience: (state) => {
      state.parsed = null;
    },
    removeParsedExperienceById: (state, action) => {
      const id = action.payload;
      if (!state.parsed || !Array.isArray(state.parsed)) return;
      if (!id) return;
      const idx = state.parsed.findIndex(e => e.__tempId === id);
      if (idx === -1) return;
      state.parsed.splice(idx, 1);
    }
  }
});

export const { setParsedExperience, clearParsedExperience, removeParsedExperienceById } = experienceSlice.actions;
export default experienceSlice.reducer;
