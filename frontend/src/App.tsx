import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@store/store';
import LoginPage from '@pages/LoginPage';
import Dashboard from '@pages/Dashboard';
import RequestsPage from '@pages/RequestsPage';
import QuotesPage from '@pages/QuotesPage';
import POsPage from '@pages/POsPage';
import VendorsPage from '@pages/VendorsPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/pos" element={<POsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
