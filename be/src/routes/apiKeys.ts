import express from 'express';
import { createKey, getKeys, deleteKey, updateKey } from '../controllers/apiKeyController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All API key routes require authentication
router.use(authenticate as any);

// Create a new API key
router.post('/', createKey as any);

// Get all API keys for the authenticated user
router.get('/', getKeys as any);

// Delete an API key
router.delete('/:keyId', deleteKey as any);

// Update an API key
router.put('/:keyId', updateKey as any);

export default router; 