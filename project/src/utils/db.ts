import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing PUBLIC_SUPABASE_URL');
}

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY');
}

export const db = createClient<Database>(supabaseUrl, supabaseKey);

export interface Post {
  id: string;
  title: string;
  content: string;
  cover: string;
  category: string;
  tags: string[];
  summary: string;
  layout: 'single' | 'two-column';
  type: 'article' | 'note' | 'tutorial';
  status: 'draft' | 'published';
  authorId: string;
  createdAt: string;
  updatedAt: string;
} 