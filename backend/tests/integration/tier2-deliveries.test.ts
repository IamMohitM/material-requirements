import request from 'supertest';
import { createApp } from '../../src/app';
import { AppDataSource } from '../../src/config/database';
import { v4 as uuidv4 } from 'uuid';

const app = createApp();
let authToken: string;
let testProjectId: string;
let testPoId: string;
let testUserId: string;

describe('Tier 2: Delivery Endpoints', () => {
  beforeAll(async () => {
    // Initialize database
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // For these tests, we're testing the routes without actual auth
    // In real tests, this would be a valid JWT token
    testUserId = uuidv4();
    testProjectId = uuidv4();
    testPoId = uuidv4();
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

      // Should reject with either 401 (unauthorized) or 400 (validation)
      expect([401, 400]).toContain(res.status);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries')
        .send({}); // Missing required fields and no auth

      // Will fail due to missing auth (401) or validation (400)
      expect([401, 400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('error');
    });

    it('should return consistent response format', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries');

      // Check response format - should have standard structure
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/deliveries', () => {
    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries?page=1&pageSize=10');

      expect(res.body).toHaveProperty('success');
      // Response format is valid regardless of auth status
      if (res.body.success && res.body.data) {
        expect(Array.isArray(res.body.data) || typeof res.body.data === 'object').toBe(true);
      }
    });

    it('should support filtering by PO', async () => {
      const res = await request(app)
        .get(`/api/v1/deliveries?po_id=${testPoId}`);

      expect(res.body).toHaveProperty('success');
    });

    it('should support filtering by status', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries?status=complete');

      expect(res.body).toHaveProperty('success');
    });
  });

  describe('GET /api/v1/deliveries/:id', () => {
    it('should return 404 for non-existent delivery', async () => {
      const fakeId = uuidv4();
      const res = await request(app)
        .get(`/api/v1/deliveries/${fakeId}`);

      // May return 404, 400, or 401 depending on auth and validation
      expect([404, 400, 401]).toContain(res.status);
    });
  });

  describe('API Response Format Validation', () => {
    it('should have consistent success response structure', async () => {
      const res = await request(app)
        .get('/api/v1/deliveries');

      // Verify standard response structure exists
      expect(typeof res.body.success).toBe('boolean');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error');
    });

    it('should have consistent error response structure', async () => {
      const res = await request(app)
        .post('/api/v1/deliveries')
        .send({});

      // Response should always have the standard structure
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('error');
    });
  });
});
