import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import deliveriesReducer from './slices/deliveriesSlice';
import invoicesReducer from './slices/invoicesSlice';
import discrepanciesReducer from './slices/discrepanciesSlice';
import requestsReducer from './slices/requestsSlice';
import vendorsReducer from './slices/vendorsSlice';
import projectsReducer from './slices/projectsSlice';
import materialsReducer from './slices/materialsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    deliveries: deliveriesReducer,
    invoices: invoicesReducer,
    discrepancies: discrepanciesReducer,
    requests: requestsReducer,
    vendors: vendorsReducer,
    projects: projectsReducer,
    materials: materialsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
