import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { GlobalSnackbar } from './components/GlobalSnackbar';
import { DashboardPage } from './pages/DashboardPage';
import { RawMaterialsPage } from './pages/RawMaterialsPage';
import { ProductsPage } from './pages/ProductsPage';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalSnackbar />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="raw-materials" element={<RawMaterialsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}