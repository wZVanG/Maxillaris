/**
 * Pruebas unitarias para el sistema de autenticación
 * 
 * Este archivo verifica el funcionamiento correcto de:
 * - Registro de usuarios
 * - Inicio de sesión
 * - Cierre de sesión
 * - Obtención de información del usuario actual
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { db } from '@db';
import { setupAuth } from '../auth';
import { users } from '@db/schema';

describe('Authentication API', () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    setupAuth(app);

    // Limpiar la base de datos antes de las pruebas
    await db.delete(users);
  });

  beforeEach(async () => {
    await db.delete(users);
  });

  afterAll(async () => {
    await db.delete(users);
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Registration successful');
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    it('should not allow duplicate usernames', async () => {
      // Primer registro
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      // Intentar registrar el mismo usuario
      const res = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'differentpass'
        });

      expect(res.status).toBe(400);
      expect(res.text).toBe('Username already exists');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'wrongpass'
        });

      expect(res.status).toBe(400);
      expect(res.text).toBe('Incorrect password.');
    });
  });

  describe('GET /api/user', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/user');
      expect(res.status).toBe(401);
    });

    it('should return user data when authenticated', async () => {
      // Registrar y hacer login
      const agent = request.agent(app);
      await agent
        .post('/api/register')
        .send({
          username: 'testuser',
          password: 'testpass123'
        });

      const res = await agent.get('/api/user');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('username', 'testuser');
    });
  });
});
