const app = require('./src/app');
const { PORT } = require('./src/config');

app.listen(PORT, () => {
  console.log(`Coffee backend running at http://localhost:${PORT}`);
});
