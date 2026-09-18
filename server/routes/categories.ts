import { Router, Response } from 'express';
import pool from '../db';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import type { Category } from '../../shared/types';

const router = Router();

// Reads stay open to every authenticated role (the POS grid filters by
// category in a later story); writes are admin/manager only, like products.

// List all categories, alphabetically (case-insensitive so Zebra never
// sorts above apple)
router.get('/', requireAuth, async (_req: AuthedRequest, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM categories ORDER BY LOWER(name) ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Shared by POST and PUT: blank and duplicate names are rejected the same
// way in both cases, so one validator keeps the two routes from drifting.
const MAX_NAME_LENGTH = 255;
function validateCategoryBody(body: any): { name: string } | string {
  const { name } = body ?? {};
  if (typeof name !== 'string' || name.trim() === '') {
    return 'Category name must be non-empty';
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return `Category name must be ${MAX_NAME_LENGTH} characters or fewer`;
  }
  return { name: name.trim() };
}

// The UNIQUE column is case-sensitive, so concept-duplicates differing only
// by case need an explicit check; a concurrent insert racing this check
// still falls back to the 23505 mapping below.
async function isDuplicateName(name: string, exceptId?: number) {
  const { rows } = await pool.query(
    'SELECT 1 FROM categories WHERE LOWER(name) = LOWER($1) AND ($2::int IS NULL OR id <> $2)',
    [name, exceptId ?? null]
  );
  return rows.length > 0;
}

// Map a unique-violation on the name column to a 409 the client can show.
// (Races a concurrent duplicate insert past the explicit check above.)
function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string }).code === '23505';
}

// Numeric :id guard: without it a garbage id reaches pg as an int
// comparison and surfaces as a 500 instead of a 400.
function parseCategoryId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Create category
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    try {
      const valid = validateCategoryBody(req.body);
      if (typeof valid === 'string') {
        res.status(400).json({ error: valid });
        return;
      }
      if (await isDuplicateName(valid.name)) {
        res.status(409).json({ error: 'A category with that name already exists' });
        return;
      }
      const { rows } = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [valid.name]
      );
      res.status(201).json(rows[0]);
    } catch (error) {
      if (isUniqueViolation(error)) {
        res.status(409).json({ error: 'A category with that name already exists' });
        return;
      }
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

// Rename category
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    try {
      const valid = validateCategoryBody(req.body);
      if (typeof valid === 'string') {
        res.status(400).json({ error: valid });
        return;
      }
      const id = parseCategoryId(req.params.id);
      if (id === null) {
        res.status(400).json({ error: 'Invalid category id' });
        return;
      }
      if (await isDuplicateName(valid.name, id)) {
        res.status(409).json({ error: 'A category with that name already exists' });
        return;
      }
      const { rows } = await pool.query(
        'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
        [valid.name, id]
      );
      const category = rows[0] as Category | undefined;
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error) {
      if (isUniqueViolation(error)) {
        res.status(409).json({ error: 'A category with that name already exists' });
        return;
      }
      console.error('Error renaming category:', error);
      res.status(500).json({ error: 'Failed to rename category' });
    }
  }
);

// Delete category. Refused while products still reference it: the FK would
// silently null those rows out (ON DELETE SET NULL), which reads as data
// loss rather than an explicit refusal. The guard lives inside the DELETE
// itself so no concurrent product insert can slip between a check and the
// delete; a follow-up read only decides which error to report.
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req: AuthedRequest, res: Response) => {
    try {
      const id = parseCategoryId(req.params.id);
      if (id === null) {
        res.status(400).json({ error: 'Invalid category id' });
        return;
      }
      const { rows } = await pool.query(
        `DELETE FROM categories
          WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM products WHERE category_id = $1)
          RETURNING *`,
        [id]
      );
      if (rows.length > 0) {
        res.json({ message: 'Category deleted successfully' });
        return;
      }
      const { rows: existing } = await pool.query('SELECT 1 FROM categories WHERE id = $1', [
        id
      ]);
      if (existing.length === 0) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.status(409).json({
        error: 'Cannot delete a category that still has products. Move or remove those products first.'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
);

export default router;
