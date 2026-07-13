import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase/supabaseClient';
import { useUserAuth } from '../../core/context/UserAuthContext';
import { useNotification } from '../../core/context/NotificationContext';
import { useTenant } from '../../core/context/TenantContext';
import type { Product } from '../products/types';

interface FavoriteItem {
  id: string;
  item_id: string;
  product: Product;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  isLoading: boolean;
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useUserAuth();
  const { tenant } = useTenant();
  const { showSuccess, showError, showInfo } = useNotification();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tenantId = tenant?.id;

  const refreshFavorites = async () => {
    if (!user || !tenantId) {
      setFavorites([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          item_id,
          items (
            id,
            title,
            slug,
            description,
            price,
            original_price,
            category_id,
            image_urls,
            stock_status,
            quantity,
            condition,
            brand,
            sizes,
            leeway_enabled,
            leeway_down_payment_required,
            leeway_down_payment_amount
          )
        `)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      const mapped: FavoriteItem[] = (data || [])
        .filter((f: any) => f.items !== null)
        .map((f: any) => ({
          id: f.id,
          item_id: f.item_id,
          product: {
            id: f.items.id,
            title: f.items.title,
            slug: f.items.slug,
            description: f.items.description || '',
            price: Number(f.items.price),
            original_price: f.items.original_price ? Number(f.items.original_price) : undefined,
            category_id: f.items.category_id || '',
            image_urls: f.items.image_urls || [],
            stock_status: f.items.stock_status,
            stock_quantity: f.items.quantity ? Number(f.items.quantity) : undefined,
            condition: f.items.condition,
            brand: f.items.brand || 'KBDF',
            sizes: f.items.sizes || [],
            leeway_enabled: f.items.leeway_enabled || false,
            leeway_down_payment_required: f.items.leeway_down_payment_required || false,
            leeway_down_payment_amount: f.items.leeway_down_payment_amount ? Number(f.items.leeway_down_payment_amount) : 0
          }
        }));

      setFavorites(mapped);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user, tenantId]);

  const isFavorite = (itemId: string) => {
    return favorites.some(fav => fav.item_id === itemId);
  };

  const toggleFavorite = async (product: Product) => {
    if (!user) {
      showInfo('Please sign in to add items to your favorites.');
      return;
    }
    if (!tenantId) return;

    const existingFav = favorites.find(fav => fav.item_id === product.id);

    try {
      if (existingFav) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existingFav.id);

        if (error) throw error;
        setFavorites(prev => prev.filter(fav => fav.id !== existingFav.id));
        showSuccess(`${product.title} removed from favorites.`);
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('user_favorites')
          .insert({
            tenant_id: tenantId,
            user_id: user.id,
            item_id: product.id
          })
          .select()
          .single();

        if (error) throw error;

        setFavorites(prev => [...prev, {
          id: data.id,
          item_id: product.id,
          product
        }]);
        showSuccess(`${product.title} added to favorites!`);
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      showError('Failed to update favorites: ' + (err.message || err));
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isLoading, isFavorite, toggleFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
