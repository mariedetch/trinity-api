export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'MY_SECRET_KEY',
    expiresIn: '7j',
  },
});
