const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Jenkins + Dockerrrr!' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
}
