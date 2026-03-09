// Global setup runs once before all tests
// This sets DB_TYPE before any modules are loaded
export default async () => {
  process.env.DB_TYPE = 'postgres';
  console.log('global-setup.ts: DB_TYPE set to', process.env.DB_TYPE);
};
