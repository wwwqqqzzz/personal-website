import { getCategories, getCategoryById, getCategoryBySlug } from './db';
import type { Database } from './database.types';

type Category = Database['public']['Tables']['categories']['Row'];

const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheItem<any>>();

function isCacheValid<T>(item: CacheItem<T>) {
  return Date.now() - item.timestamp < CACHE_TTL;
}

export async function getCachedCategories() {
  const cacheKey = 'categories';
  const cachedItem = cache.get(cacheKey);

  if (cachedItem && isCacheValid(cachedItem)) {
    return { data: cachedItem.data, error: null };
  }

  const { data, error } = await getCategories();

  if (!error && data) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  return { data, error };
}

export async function getCachedCategoryById(id: string) {
  const cacheKey = `category:${id}`;
  const cachedItem = cache.get(cacheKey);

  if (cachedItem && isCacheValid(cachedItem)) {
    return { data: cachedItem.data, error: null };
  }

  const { data, error } = await getCategoryById(id);

  if (!error && data) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  return { data, error };
}

export async function getCachedCategoryBySlug(slug: string) {
  const cacheKey = `category:slug:${slug}`;
  const cachedItem = cache.get(cacheKey);

  if (cachedItem && isCacheValid(cachedItem)) {
    return { data: cachedItem.data, error: null };
  }

  const { data, error } = await getCategoryBySlug(slug);

  if (!error && data) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  return { data, error };
}

export function invalidateCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

export function invalidateCategoryCache(id?: string) {
  if (id) {
    cache.delete(`category:${id}`);
    // Also invalidate the categories list since it might be affected
    cache.delete('categories');
  } else {
    // Invalidate all category-related caches
    for (const key of cache.keys()) {
      if (key.startsWith('category:') || key === 'categories') {
        cache.delete(key);
      }
    }
  }
} 