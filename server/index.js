require('dotenv').config();
const express = require('express');
const projectsRouter = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/projects', projectsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
