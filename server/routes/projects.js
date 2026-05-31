const { Router } = require('express');
const pool = require('../db');

const router = Router();

function isInvalidUuid(err) {
  return err.code === '22P02' && err.routine === 'string_to_uuid';
}

function computeStatus(steps) {
  const completed = steps.filter((s) => s.status === true).length;
  if (completed === 0) return 'planned';
  if (completed === steps.length) return 'done';
  return 'ongoing';
}

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, steps } = req.body;
    const status = computeStatus(steps || []);
    const { rows } = await pool.query(
      `INSERT INTO projects (name, steps, status)
       VALUES ($1, $2::jsonb, $3)
       RETURNING *`,
      [name, JSON.stringify(steps), status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (isInvalidUuid(err)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM projects WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(204).send();
  } catch (err) {
    if (isInvalidUuid(err)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    next(err);
  }
});

router.patch('/:id/steps/:stepId', async (req, res, next) => {
  try {
    const { id, stepId } = req.params;
    const order = parseInt(stepId, 10);

    const { rows: projectRows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectRows[0];
    const steps = project.steps;
    const stepIndex = steps.findIndex((s) => s.order === order);

    if (stepIndex === -1) {
      return res.status(404).json({ error: 'Step not found' });
    }

    steps[stepIndex].status = !steps[stepIndex].status;
    const status = computeStatus(steps);

    const { rows } = await pool.query(
      `UPDATE projects SET steps = $1::jsonb, status = $2 WHERE id = $3 RETURNING *`,
      [JSON.stringify(steps), status, id]
    );

    res.json(rows[0]);
  } catch (err) {
    if (isInvalidUuid(err)) {
      return res.status(404).json({ error: 'Project not found' });
    }
    next(err);
  }
});

module.exports = router;
