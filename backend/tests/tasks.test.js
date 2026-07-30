const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/Task');

describe('Task Management API (CRUD, Search, Filter, Sort & Pagination - Phase 2)', () => {
  let userAToken;
  let userBToken;
  let userAId;

  beforeEach(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User A',
        email: 'usera@example.com',
        password: 'passwordA',
      });
    userAToken = resA.body.token;
    userAId = resA.body.user._id;

    // Register User B (for testing ownership isolation)
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User B',
        email: 'userb@example.com',
        password: 'passwordB',
      });
    userBToken = resB.body.token;
  });

  describe('POST /api/tasks (Create Task)', () => {
    it('should create a new task for an authenticated user', async () => {
      const taskData = {
        title: 'Complete assignment',
        description: 'Build Full Stack Task Management App',
        priority: 'High',
        status: 'In Progress',
        dueDate: new Date('2026-08-01').toISOString(),
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(taskData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.task.title).toBe(taskData.title);
      expect(res.body.task.userId).toBe(userAId);
    });

    it('should reject task creation without authentication', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Unauthenticated Task',
          dueDate: new Date('2026-08-01').toISOString(),
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should reject task creation if title or dueDate is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Missing Due Date' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Please provide task title and due date/i);
    });
  });

  describe('GET /api/tasks (View Tasks, Ownership, Search, Filter, Sort, Pagination)', () => {
    beforeEach(async () => {
      // Create 3 tasks for User A
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Write React Frontend',
          priority: 'High',
          status: 'In Progress',
          dueDate: new Date('2026-08-02').toISOString(),
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Setup MongoDB Database',
          priority: 'Medium',
          status: 'Completed',
          dueDate: new Date('2026-08-01').toISOString(),
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Write Unit Tests',
          priority: 'Low',
          status: 'Pending',
          dueDate: new Date('2026-08-03').toISOString(),
        });

      // Create 1 task for User B
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'User B Secret Task',
          priority: 'High',
          status: 'Pending',
          dueDate: new Date('2026-08-05').toISOString(),
        });
    });

    it('should return only tasks belonging to the authenticated user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.totalTasks).toBe(3);
      expect(res.body.tasks.some((t) => t.title === 'User B Secret Task')).toBe(
        false
      );
    });

    it('should search tasks by title (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/tasks?search=react')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(res.body.tasks).toHaveLength(1);
      expect(res.body.tasks[0].title).toBe('Write React Frontend');
    });

    it('should filter tasks by status and priority', async () => {
      const resStatus = await request(app)
        .get('/api/tasks?status=Completed')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(resStatus.body.tasks).toHaveLength(1);
      expect(resStatus.body.tasks[0].title).toBe('Setup MongoDB Database');

      const resPriority = await request(app)
        .get('/api/tasks?priority=High')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(resPriority.body.tasks).toHaveLength(1);
      expect(resPriority.body.tasks[0].priority).toBe('High');
    });

    it('should sort tasks by dueDate ascending and descending', async () => {
      const resAsc = await request(app)
        .get('/api/tasks?sortBy=dueDate&order=asc')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(resAsc.body.tasks[0].title).toBe('Setup MongoDB Database'); // Aug 1
      expect(resAsc.body.tasks[2].title).toBe('Write Unit Tests'); // Aug 3

      const resDesc = await request(app)
        .get('/api/tasks?sortBy=dueDate&order=desc')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(resDesc.body.tasks[0].title).toBe('Write Unit Tests'); // Aug 3
    });

    it('should paginate tasks accurately', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(res.body.count).toBe(2);
      expect(res.body.totalTasks).toBe(3);
      expect(res.body.totalPages).toBe(2);
      expect(res.body.currentPage).toBe(1);
    });
  });

  describe('GET /api/tasks/stats (Dashboard Statistics)', () => {
    it('should return accurate task statistics for the user', async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Task 1',
          status: 'Completed',
          priority: 'High',
          dueDate: new Date().toISOString(),
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Task 2',
          status: 'Pending',
          priority: 'Medium',
          dueDate: new Date().toISOString(),
        });

      const res = await request(app)
        .get('/api/tasks/stats')
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalTasks).toBe(2);
      expect(res.body.stats.completedTasks).toBe(1);
      expect(res.body.stats.pendingTasks).toBe(1);
      expect(res.body.stats.byPriority.High).toBe(1);
      expect(res.body.stats.byPriority.Medium).toBe(1);
    });
  });

  describe('PUT & DELETE /api/tasks/:id (Update, Delete, and Security/Ownership)', () => {
    let taskAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Task to update',
          status: 'Pending',
          priority: 'Low',
          dueDate: new Date().toISOString(),
        });
      taskAId = res.body.task._id;
    });

    it('should allow owner to update a task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Updated Task Title',
          status: 'Completed',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.task.title).toBe('Updated Task Title');
      expect(res.body.task.status).toBe('Completed');
    });

    it('should reject update if another user attempts it (403 Unauthorized)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Hacked by User B',
        })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Not authorized/i);
    });

    it('should allow owner to delete a task', async () => {
      await request(app)
        .delete(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(200);

      const checkRes = await request(app)
        .get(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .expect(404);

      expect(checkRes.body.success).toBe(false);
    });

    it('should reject delete if another user attempts it (403 Unauthorized)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Not authorized/i);
    });
  });
});
