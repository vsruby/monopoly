import { FastifyPluginAsync } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import { users } from '../db/schemas/index.js';

const createUserBodySchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    fullName: { type: 'string' },
  },
  required: ['email', 'fullName'],
} as const;
type CreateUserBody = FromSchema<typeof createUserBodySchema>;

const showUserParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
} as const;
type ShowUserParam = FromSchema<typeof showUserParamSchema>;

export const usersPlugin: FastifyPluginAsync = async (app) => {
  app.get('/users', async (_req, res) => {
    const users = await app.db.query.users.findMany();

    return res.status(200).send({ users });
  });

  app.get<{ Params: ShowUserParam }>('/users/:id', { schema: { params: showUserParamSchema } }, async (req, res) => {
    const { id } = req.params;

    const user = await app.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    return res.status(200).send({ user });
  });

  app.post<{ Body: CreateUserBody }>('/users', { schema: { body: createUserBodySchema } }, async (req, res) => {
    const { email, fullName } = req.body;

    const response = await app.db.insert(users).values({ email, fullName }).returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });
    const user = response[0];

    return res.status(201).send({ user });
  });
};
