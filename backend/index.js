const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();                       //Creates an Express app.
const port = process.env.PORT || 3000;       //Uses PORT from environment variables (set in ConfigMap) or defaults to 3000.

// CORS middleware
//Enables CORS (Cross-Origin Resource Sharing).
//Allows frontend apps from any origin to access this backend API.
//Handles preflight (OPTIONS) requests automatically.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());  //Allows Express to parse incoming JSON request bodies.

// Creates a PostgreSQL connection pool using environment variables.
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'bloguser',
  password: process.env.DB_PASS || 'blogpass',
  database: process.env.DB_NAME || 'blogdb',
  port: process.env.DB_PORT || 5432,
});

// Initialize the Database
const initialize = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ posts table ready.');
  } catch (err) {
    console.error('❌ table could not be created:', err.message);
    process.exit(1);
  }
};

// API Routes 

//API endpoints (/api/posts)
app.post('/api/posts', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content)  //if empty
    return res.status(400).json({ error: 'The title and content fields are mandatory.' });

  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',  //Inserts a new post (title, content) into DB.
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/posts', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');  //Retrieves all posts from DB.
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ DELETE endpoint (/api/posts/:id)
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ 
      message: 'Post deleted successfully',
      deleted_post: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: err.message });
  }
});

// They do the exact same thing as the /api/posts versions but under a different path. (post - get - delete)

app.post('/posts', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: 'title ve content alanları zorunludur.' });

  try {
    const result = await pool.query(
      'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/posts', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ 
      message: 'Post deleted successfully',
      deleted_post: result.rows[0]
    });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (_req, res) => res.send('OK'));

// Ana sayfa - ✅ Endpoint list
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Mini Blog Backend API',
    endpoints: [
      'GET /health',
      'GET /posts or /api/posts',
      'POST /posts or /api/posts',
      'DELETE /posts/:id or /api/posts/:id'  
    ]
  });
});

// start server
initialize().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Backend is working: http://0.0.0.0:${port}`);
  });
});