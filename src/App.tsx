import { Routes, Route } from "react-router-dom";
import { AppShell } from "./core/layout/AppShell";
import { HomePage } from "./features/home/HomePage";
import { TrackPage } from "./features/track/TrackPage";
import { ShopPage } from "./features/shop/ShopPage";
import { CategoriesPage } from "./features/categories/CategoriesPage";
import { ContactPage } from "./features/contact/ContactPage";
import { AuthPage } from "./features/auth/AuthPage";
import { CartProvider } from "./features/cart/CartContext";
import { CartDrawer } from "./features/cart/CartDrawer";

function App() {
  return (
    <CartProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
        <CartDrawer />
      </AppShell>
    </CartProvider>
  );
}

export default App;
