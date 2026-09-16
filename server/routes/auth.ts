import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db';
import { requireAuth, requireRole, signToken, AuthedRequest } from '../middleware/auth';
import type { User, UserRole } from '../../shared/types';

const router = Router();

const VALID_ROLES: UserRole[] = ['admin', 'cashier', 'manager'];

// Compared against when the email is unknown, so that a failed login takes
// roughly the same time whether or not the account exists.
const TIMING_EQUALIZER_HASH = bcrypt.hashSync('not-a-real-password', 10);

// POST /api/auth/login
router.post('/login', async (req: AuthedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { rows } = await pool.query(
      'SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1',
      [email]
    );
    const record = rows[0] as (User & { password_hash: string }) | undefined;

    const passwordMatches = await bcrypt.compare(
      password,
      record?.password_hash ?? TIMING_EQUALIZER_HASH
    );

    if (!record || !passwordMatches) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user: User = {
      id: record.id,
      email: record.email,
      role: record.role,
      created_at: record.created_at
    };

    res.json({ token: signToken({ userId: user.id, role: user.role }), user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register — admin only, because there is no public signup (IG-2).
router.post('/register', requireAuth, requireRole('admin'), async (req: AuthedRequest, res: Response) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const assignedRole: UserRole = VALID_ROLES.includes(role) ? (role as UserRole) : 'cashier';
    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email, passwordHash, assignedRole]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    // 23505 = unique_violation on the email column.
    if ((error as { code?: string }).code === '23505') {
      res.status(409).json({ error: 'A user with that email already exists' });
      return;
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// GET /api/auth/me — requireAuth already resolved and stripped the user.
router.get('/me', requireAuth, (req: AuthedRequest, res: Response) => {
  res.json(req.user);
});

export default router;