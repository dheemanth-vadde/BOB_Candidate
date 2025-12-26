import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../components/auth/store/userSlice';
import digilockerReducer from '../components/integrations/digilocker/digilockerSlice';
import preferenceReducer from "../components/jobs/store/preferenceSlice";
import documentTypesReducer from '../components/profile/store/documentTypesSlice';
import idProofReducer from '../components/profile/store/idProofSlice';

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
     preference: preferenceReducer,
    documentTypes: documentTypesReducer,
    idProof: idProofReducer,
  },
});

export const persistor = persistStore(store);
