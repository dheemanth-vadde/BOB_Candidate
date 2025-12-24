import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import masterApi from '../../../services/master.api';

// Async thunk
export const fetchDocumentTypes = createAsyncThunk(
  'documentTypes/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await masterApi.getDocumentTypes();
      return res.data; // assume API returns array
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch document types');
    }
  }
);

const documentTypesSlice = createSlice({
  name: 'documentTypes',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDocumentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default documentTypesSlice.reducer;
