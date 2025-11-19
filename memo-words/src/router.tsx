import { createBrowserRouter, Navigate } from 'react-router-dom';
import CardsPage from './pages/CardsPage';
import LoginPage from './pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/cards" replace />,
  },
  {
    path: '/cards',
    element: <CardsPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);


