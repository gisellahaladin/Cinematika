const express = require('express');
require('dotenv/config');
const app = express();
const PORT = process.env.PORT || 8000;

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.ELEPHANT_SQL_CONNECTION_STRING });
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/api/movies', (req, res) => {
    pool
    .query('SELECT * FROM movies;')
    .then(({ rowCount, rows }) => {
    res.json(rows);
})
    .catch(e => res.status(500).json({ message: e.message }));
});

app.get('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const safeValues = [id];

    pool
    .query('SELECT * FROM movies WHERE id = $1;', safeValues)
    .then(({ rowCount, rows }) => {
        if (rowCount === 0) {
            res.status(404).json({ error: `Movie with id ${id} Not Found` });
        } else {
            res.json(rows[0]);
        }
    })
    .catch(e => res.status(500).json({ message: e.message }));
});

app.post('/api/movies', (req, res) => {
    const { title, director, year } = req.body;
    const safeValues = [title, director, year];

    pool
    .query('INSERT INTO movies (title, director, year) VALUES ($1, $2, $3) RETURNING *', safeValues)
    .then(({ rowCount, rows }) => {
        if (rowCount === 0) {
            res.status(500).json({ error: 'Failed to add the movie' });
        } else {
            res.status(201).json(rows[0]);
        }
    })
    .catch(e => res.status(500).json({ message: e.message }));
});

app.put('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const { title, director, year } = req.body;

    const safeValues = [title, director, year, id];

    pool
    .query('UPDATE movies SET title = $1, director = $2, year = $3 WHERE id = $4 RETURNING *', safeValues)
    .then(({ rowCount, rows }) => {
        if (rowCount === 0) {
            res.status(404).json({ error: `Movie with id ${id} Not Found` });
        } else {
            res.json(rows[0]);
        }
    })
    .catch(e => res.status(500).json({ message: e.message }));
});

app.delete('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const safeValues = [id];

    pool
    .query('DELETE FROM movies WHERE id = $1 RETURNING *', safeValues)
    .then(({ rowCount, rows }) => {
        if (rowCount === 0) {
            res.status(404).json({ error: `Movie with id ${id} Not Found` });
        } else {
            res.json(rows[0]);
        }
    })
    .catch(e => res.status(500).json({ message: e.message }));
});

app.listen(PORT, () => console.log(`We are watching you on ${PORT}`));