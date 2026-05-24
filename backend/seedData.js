const { seedDatabase } = require('./mongo');

seedDatabase()
  .then(() => {
    console.log('Railway seed complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Railway seed failed:', error);
    process.exit(1);
  });
