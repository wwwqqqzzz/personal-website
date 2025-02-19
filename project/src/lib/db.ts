import { supabase } from './supabase';
import type { Database } from './database.types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true });

  return { data, error };
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function createCategory(category: CategoryInsert) {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  return { data, error };
}

export async function updateCategory(id: string, category: CategoryUpdate) {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  return { error };
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  return { data, error };
}

export async function getChildCategories(parentId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('order', { ascending: true });

  return { data, error };
}

export async function updateCategoryOrder(id: string, order: number) {
  const { data, error } = await supabase
    .from('categories')
    .update({ order })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
} 