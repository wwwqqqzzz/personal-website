import type { Tables } from '../lib/database.types';

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      role: 'admin' | 'user';
    } & Partial<Tables['admins']['Row']>;
  }
} 