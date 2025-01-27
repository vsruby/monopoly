import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { format } from 'path';
import { users } from '../db/schemas/index.js';

const createUserSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    fullName: { type: 'string' },
  },
  required: ['email', 'fullName'],
} as const;
type CreateUserBody = FromSchema<typeof createUserSchema>;

export const usersPlugin: FastifyPluginAsync = async (app) => {
  app.get('/users', async (_req, res) => {
    const users = await app.db.query.users.findMany();

    return res.status(200).send({ users });
  });

  app.post<{ Body: CreateUserBody }>('/users', { schema: { body: createUserSchema } }, async (req, res) => {
    const { email, fullName } = req.body;

    const user = await app.db.insert(users).values({ email, fullName }).returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return res.status(201).send({ user });
  });
};
