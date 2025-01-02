export default () => ({
  csrf: {
    secret: process.env.CSRF_SECRET || 'MY_CSRF_SECRET',
    cookieName: '__Host-psifi.x-csrf-token',
  },
});
