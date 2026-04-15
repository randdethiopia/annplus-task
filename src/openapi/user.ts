export const UserResponse = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: {
      type: 'string',
      enum: ['SUPERVISOR', 'TEAMLEAD', 'SUPERADMIN'],
    },
  },
};
