import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import digilockerReducer from './digilockerSlice';

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Persist ONLY the user slice
const userPersistConfig = {
  key: 'user',
  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,     // persisted ✔
    digilocker: digilockerReducer,  // NOT persisted ❌ (good)
  },
});

export const persistor = persistStore(store);
