export default () => ({
  csrf: {
    secret: process.env.CSRF_SECRET || 'CSRF_SECRET',
    cookieName: '__Host-psifi.x-csrf-token',
  },
});
