export const LoginRequest = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', format: 'password' },
  },
};

export const LoginResponse = {
  type: 'object',
  properties: {
    user: { $ref: '#/components/schemas/UserResponse' },
    token: { type: 'string', format: 'jwt' },
  },
};
