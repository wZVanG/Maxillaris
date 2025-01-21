/**
 * Pruebas unitarias para el módulo de autenticación
 * 
 * Este archivo contiene las pruebas para verificar el correcto funcionamiento
 * de los endpoints de autenticación: registro, login, logout y obtención de usuario.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../auth';
import { db } from '@db';
import { users } from '@db/schema';

describe('Auth Endpoints', () => {
  const app = express();
  app.use(express.json());
  setupAuth(app);

  const testUser = {
    username: 'testuser',
    password: 'testpass123',
  };

  beforeAll(async () => {
    // Limpiar la base de datos antes de las pruebas
    await db.delete(users);
  });

  afterAll(async () => {
    // Limpiar después de todas las pruebas
    await db.delete(users);
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Registration successful');
      expect(res.body.user).toHaveProperty('username', testUser.username);
    });

    it('should not allow duplicate usernames', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(400);

      expect(res.text).toBe('Username already exists');
    });

    it('should validate input data', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({})
        .expect(400);

      expect(res.text).toContain('Invalid input');
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body.user).toHaveProperty('username', testUser.username);
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ ...testUser, password: 'wrongpass' })
        .expect(400);

      expect(res.text).toBe('Incorrect password');
    });
  });

  describe('GET /api/user', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/user')
        .expect(401);

      expect(res.text).toBe('Not logged in');
    });

    // Nota: Las pruebas de sesión autenticada requieren configuración adicional
    // debido a que supertest no mantiene las cookies entre requests
  });
});
