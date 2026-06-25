import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthSync } from 'hooks/useAuthSync';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './feature/Header/Header';
import { ScrollToTopButton } from './feature/ScrollToTopButton/ScrollToTopButton';
import Details from './pages/Details/Details';
import List from './pages/List/List';
import { Profile } from './pages/Profile/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30
    }
  }
});

function App() {
  useAuthSync();

  return (
    <div className="app-container">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Header />
          <Routes>
            <Route path="/details/:id" element={<Details />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<List />} />
          </Routes>
          <ScrollToTopButton />
        </QueryClientProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
