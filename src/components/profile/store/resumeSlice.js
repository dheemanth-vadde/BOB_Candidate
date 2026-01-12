import { createSlice } from '@reduxjs/toolkit';

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    parsed: null,
  },
  reducers: {
    setParsedResume: (state, action) => {
      state.parsed = action.payload;
    },
    clearParsedResume: (state) => {
      state.parsed = null;
    }
    ,
    removeParsedEducationById: (state, action) => {
      const id = action.payload;
      if (!state.parsed || !Array.isArray(state.parsed.education)) return;
      if (!id) return;
      const idx = state.parsed.education.findIndex(e => e.__tempId === id);
      if (idx === -1) return;
      state.parsed.education.splice(idx, 1);
    }
  }
});

export const { setParsedResume, clearParsedResume, removeParsedEducationById } = resumeSlice.actions;
export default resumeSlice.reducer;
