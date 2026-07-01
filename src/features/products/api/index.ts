import type { Product } from '../types';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'The Continental Tote',
    slug: 'the-continental-tote',
    description: 'A masterpiece in fine-grained calfskin leather with a minimalist silhouette.',
    price: 3200,
    category_id: 'bags',
    image_urls: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop'],
    stock_status: 'in_stock',
    condition: 'new',
    brand: 'KBDF',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Vintage Quilted Chain',
    slug: 'vintage-quilted-chain',
    description: 'Preloved excellent condition, featuring signature interlocking closure and gold-tone hardware.',
    price: 4500,
    original_price: 5200,
    category_id: 'preloved-bags',
    image_urls: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'],
    stock_status: 'in_stock',
    condition: 'preloved_excellent',
    brand: 'Heritage',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Minimalist Cardholder',
    slug: 'minimalist-cardholder',
    description: 'Sleek, essential, and crafted from sustainable pebble leather.',
    price: 450,
    category_id: 'wallets',
    image_urls: ['https://images.unsplash.com/photo-1606503825008-9087118151eb?q=80&w=800&auto=format&fit=crop'],
    stock_status: 'low_stock',
    condition: 'new',
    brand: 'KBDF',
    created_at: new Date().toISOString()
  }
];

export async function fetchProducts(): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_PRODUCTS;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
}
