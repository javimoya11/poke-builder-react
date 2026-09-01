import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResetPasswordModal } from 'components/ResetPasswordModal/ResetPasswordModal';
import { useAuthSync } from 'hooks/useAuthSync';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './App.css';
import { Footer } from './feature/Footer/Footer';
import { Header } from './feature/Header/Header';
import { useModalBackButton } from './feature/Modal/useModalBackButton';
import { ScrollToTopButton } from './feature/ScrollToTopButton/ScrollToTopButton';
import { List } from './pages/List/List';
import { Profile } from './pages/Profile/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30
    }
  }
});

const Root = () => {
  useAuthSync();
  useModalBackButton();

  return (
    <div className="app-container">
      <QueryClientProvider client={queryClient}>
        <Header />
        <Outlet />
        <ScrollToTopButton />
        <Footer />
        <ResetPasswordModal />
      </QueryClientProvider>
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/teams', element: <Profile /> },
      { path: '/reset-password', element: <List /> },
      { path: '/', element: <List /> }
    ]
  }
]);

export const App = () => <RouterProvider router={router} />;
