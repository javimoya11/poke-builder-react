import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Details from "./pages/Details";
import List from "./pages/List";
import Header from "./feature/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

function App() {
  return (
    <div>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <header>
            <Header />
          </header>
          <Routes>
            <Route path="/" element={<List />} />
            <Route path="/details" element={<Details />} />
          </Routes>
        </QueryClientProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
