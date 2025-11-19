import { createBrowserRouter, Navigate } from 'react-router-dom';
import CardsPage from './pages/CardsPage';
import LoginPage from './pages/LoginPage';
import AddCardPage from './pages/AddCardPage';

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
    path: '/cards/new',
    element: <Navigate to="/cards/add" replace />,
  },
  {
    path: '/cards/add',
    element: <AddCardPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);


