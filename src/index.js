import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import axios from "axios";

// 👉 GLOBAL DIGILOCKER SANDBOX INTERCEPTOR
axios.interceptors.request.use((config) => {
  const token = store.getState()?.digilocker?.sandboxToken;

  if (token) {
    config.headers["X-Digilocker-Token"] = token;
  }

  return config;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
