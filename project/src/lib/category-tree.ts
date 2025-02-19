import type { Database } from './database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryNode extends Category {
  children: CategoryNode[];
}

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const categoryMap = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // First pass: Create all nodes
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    });
  });

  // Second pass: Build the tree
  categories.forEach(category => {
    const node = categoryMap.get(category.id)!;
    
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort the tree
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(roots);
  return roots;
}

export function flattenCategoryTree(tree: CategoryNode[]): Category[] {
  const result: Category[] = [];

  const flatten = (nodes: CategoryNode[], level = 0) => {
    nodes.forEach(node => {
      const { children, ...category } = node;
      result.push(category);
      
      if (children.length > 0) {
        flatten(children, level + 1);
      }
    });
  };

  flatten(tree);
  return result;
}

export function findCategoryPath(categories: Category[], targetId: string): Category[] {
  const categoryMap = new Map<string, Category>();
  categories.forEach(category => categoryMap.set(category.id, category));

  const path: Category[] = [];
  let currentId: string | null = targetId;

  while (currentId) {
    const category = categoryMap.get(currentId);
    if (!category) break;

    path.unshift(category);
    currentId = category.parent_id;
  }

  return path;
}

export function getDescendantIds(tree: CategoryNode[]): string[] {
  const ids: string[] = [];

  const collect = (nodes: CategoryNode[]) => {
    nodes.forEach(node => {
      ids.push(node.id);
      if (node.children.length > 0) {
        collect(node.children);
      }
    });
  };

  collect(tree);
  return ids;
}

export function findCategoryNode(tree: CategoryNode[], id: string): CategoryNode | null {
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }

    if (node.children.length > 0) {
      const found = findCategoryNode(node.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function validateCategoryTree(categories: Category[]): boolean {
  const categoryMap = new Map<string, Category>();
  categories.forEach(category => categoryMap.set(category.id, category));

  // Check for circular references
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const hasCycle = (id: string): boolean => {
    if (!categoryMap.has(id)) return false;
    if (recursionStack.has(id)) return true;
    if (visited.has(id)) return false;

    visited.add(id);
    recursionStack.add(id);

    const category = categoryMap.get(id)!;
    if (category.parent_id && hasCycle(category.parent_id)) {
      return true;
    }

    recursionStack.delete(id);
    return false;
  };

  for (const category of categories) {
    if (hasCycle(category.id)) {
      return false;
    }
  }

  return true;
} 