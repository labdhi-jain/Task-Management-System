const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Authentication API & JWT Middleware (Phase 1)', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
  };

  let token;
  let refreshToken;

  describe('POST /api/auth/register', () => {
    it('should register a new user and return JWT tokens', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.password).toBeUndefined();

      // Ensure user was saved in DB and password was hashed
      const dbUser = await User.findOne({ email: testUser.email }).select(
        '+password'
      );
      expect(dbUser).toBeDefined();
      expect(dbUser.password).not.toBe(testUser.password);
    });

    it('should reject registration with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser).expect(201);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/User already exists/i);
    });

    it('should reject registration if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'John Doe', email: 'john@example.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should authenticate user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);

      token = res.body.token;
      refreshToken = res.body.refreshToken;
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid email or password/i);
    });
  });

  describe('GET /api/auth/me (JWT Middleware Verification)', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      token = res.body.token;
    });

    it('should return logged in user profile when valid Authorization header is sent', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject request when Authorization header is missing', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no token provided/i);
    });

    it('should reject request when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_jwt_token_12345')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/token failed/i);
    });
  });

  describe('POST /api/auth/refresh & POST /api/auth/logout', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      token = res.body.token;
      refreshToken = res.body.refreshToken;
    });

    it('should refresh access token when valid refresh token is sent', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should logout user and clear refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Refreshing token should now fail
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(403);
    });
  });
});
