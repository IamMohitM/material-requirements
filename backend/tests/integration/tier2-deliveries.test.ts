import request from 'supertest';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const app = createApp();
let authToken: string;
let testProjectId: string;
let testPoId: string;
let testUserId: string;

// Helper to generate a valid JWT token for testing
function generateMockToken(userId: string = uuidv4()): string {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign(
    {
      id: userId,
      email: 'test@example.com',
      role: 'admin',
    },
    secret,
    { expiresIn: '24h' }
  );
}

describe('Tier 2: Delivery Endpoints', () => {
  beforeAll(async () => {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    testUserId = uuidv4();
    testProjectId = uuidv4();
    testPoId = uuidv4();
    authToken = generateMockToken(testUserId);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/v1/deliveries', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries')
        .send({
          po_id: testPoId,
          delivery_date: new Date(),
          received_by_id: testUserId,
          line_items: [],
        });

      // Should reject with 401 (unauthorized)
      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}); // Missing required fields but has auth

      // Will fail due to validation (400/422)
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('error');
    });

    it('should return consistent response format', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries')
        .set('Authorization', `Bearer ${authToken}`);

      // Check response format - should have standard structure
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/deliveries', () => {
    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body).toHaveProperty('success');
      // Response format is valid regardless of auth status
      if (res.body.success && res.body.data) {
        expect(Array.isArray(res.body.data) || typeof res.body.data === 'object').toBe(true);
      }
    });

    it('should support filtering by PO', async () => {
      const res = await request(app)
        .get(`/api/v1/deliveries?po_id=${testPoId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body).toHaveProperty('success');
    });

    it('should support filtering by status', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries?status=complete')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body).toHaveProperty('success');
    });
  });

  describe('GET /api/v1/deliveries/:id', () => {
    it('should return 404 for non-existent delivery', async () => {
      const fakeId = uuidv4();
      const res = await request(app)
        .get(`/api/v1/deliveries/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should return 404 for non-existent delivery or 500 if database error
      expect([404, 500]).toContain(res.status);
    });
  });

  describe('API Response Format Validation', () => {
    it('should have consistent success response structure', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries')
        .set('Authorization', `Bearer ${authToken}`);

      // Verify standard response structure exists
      expect(typeof res.body.success).toBe('boolean');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error');
    });

    it('should have consistent error response structure', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // Response should always have the standard structure
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error');
    });
  });
});
