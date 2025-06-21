require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';
const jwtSecret = process.env.JWT_SECRET || 'your_default_jwt_secret';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '')));

// MongoDB Connection
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbCluster = "clusterfortesting.pp3jsjt.mongodb.net";
const dbName = "blog";

const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbCluster}/?retryWrites=true&w=majority&appName=ClusterForTesting`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Swagger Definition
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Stefan Ramac Portfolio API',
            version: '1.0.0',
            description: `This is the complete API documentation for the backend of the stefanramac.com portfolio website.
                        The API is built with Node.js, Express.js, and MongoDB. It handles user authentication (registration and login with JWT), 
                        and full CRUD (Create, Read, Update, Delete) operations for blog posts. 
                        It's designed to be RESTful and provides a clear interface for the frontend to consume.`,
            contact: {
                name: 'Stefan Ramač',
                url: 'https://stefanramac.com',
                email: 'stefanramac@gmail.com'
            }
        },
        servers: [
            {
                url: 'https://stefanramac.com',
                description: 'Production Server'
            },
            {
                url: `http://localhost:${port}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./server.js'] 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

let db;

const logErrorToFile = (error) => {
    try {
        fs.appendFileSync(path.join(__dirname, 'startup_errors.log'), `${new Date().toISOString()}: ${error.stack || error}\n\n`);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
};

process.on('uncaughtException', (err, origin) => {
    logErrorToFile(new Error(`Uncaught Exception: ${err.message}\nOrigin: ${origin}\nStack: ${err.stack}`));
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logErrorToFile(new Error(`Unhandled Rejection at: ${promise}\nReason: ${reason}`));
});

async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    logErrorToFile(err);
    process.exit(1);
  }
}

connectDB();

// ===== API Routes =====

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Retrieve a list of all blog posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Failed to fetch posts
 */
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await db.collection('posts').find({}).sort({ publishDate: -1 }).toArray();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch posts", error: err.message });
    }
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve a list of all unique post categories
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of unique categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Failed to fetch categories
 */
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.collection('posts').distinct('categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch categories", error: err.message });
    }
});

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastname
 *               - nickname
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Petar
 *               lastname:
 *                 type: string
 *                 example: Petrović
 *               nickname:
 *                 type: string
 *                 example: pera
 *               email:
 *                 type: string
 *                 format: email
 *                 example: petar.petrovic@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: lozinka123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: All fields are required
 *       409:
 *         description: User with this email already exists
 *       500:
 *         description: Server error
 */
app.post('/api/register', async (req, res) => {
    try {
        const { name, lastname, nickname, email, password } = req.body;
        if (!name || !lastname || !nickname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            lastname,
            nickname,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };
        await db.collection('users').insertOne(newUser);
        
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error during registration", error: err.message });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: petar.petrovic@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: lozinka123
 *     responses:
 *       200:
 *         description: Login successful, returns token and nickname
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 nickname:
 *                   type: string
 *                   example: pera
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id, nickname: user.nickname }, jwtSecret, { expiresIn: '1h' });
        res.json({ message: "Login successful", token, nickname: user.nickname });

    } catch (err) {
        res.status(500).json({ message: "Server error during login", error: err.message });
    }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - summary
 *               - imageUrl
 *               - mainCategory
 *               - categories
 *               - readingTime
 *               - link
 *             properties:
 *               title:
 *                 type: string
 *                 example: Moj Prvi Blog Post
 *               summary:
 *                 type: string
 *                 example: Ovo je kratak opis mog prvog blog posta o integracijama.
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://stefanramac.com/img/blog/integracije.jpg
 *               mainCategory:
 *                 type: string
 *                 example: Integracije
 *               categories:
 *                 type: string
 *                 description: Comma-separated list of categories
 *                 example: integracije, webmethods, java
 *               readingTime:
 *                 type: integer
 *                 example: 7
 *               link:
 *                 type: string
 *                 format: uri
 *                 example: https://stefanramac.com/blog/moj-prvi-post
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized (token is missing or invalid)
 *       403:
 *         description: Forbidden (token is invalid)
 *       500:
 *         description: Failed to create post
 */
app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { title, summary, imageUrl, mainCategory, categories, readingTime, link } = req.body;
        
        const newPost = {
            title,
            summary,
            imageUrl,
            mainCategory,
            categories: categories.split(',').map(cat => cat.trim()),
            readingTime: parseInt(readingTime),
            link,
            publishDate: new Date(),
            authorId: new ObjectId(req.user.userId)
        };

        const result = await db.collection('posts').insertOne(newPost);
        res.status(201).json({ message: "Post created successfully", insertedId: result.insertedId });

    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Failed to create post", error: err.message });
    }
});

/**
 * @swagger
 * /api/myposts:
 *   get:
 *     summary: Retrieve all posts created by the logged-in user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch posts
 */
app.get('/api/myposts', authenticateToken, async (req, res) => {
    try {
        const userId = new ObjectId(req.user.userId);
        const posts = await db.collection('posts').find({ authorId: userId }).sort({ publishDate: -1 }).toArray();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch user posts", error: err.message });
    }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Retrieve a single blog post by its ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: A single post.
 *       404:
 *         description: Post not found
 *       500:
 *         description: Failed to fetch post
 */
app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = new ObjectId(req.params.id);
        const post = await db.collection('posts').findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch post", error: err.message });
    }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               summary: { type: string }
 *               imageUrl: { type: string }
 *               mainCategory: { type: string }
 *               categories: { type: string }
 *               readingTime: { type: integer }
 *               link: { type: string }
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Forbidden - you can only update your own posts
 *       404:
 *         description: Post not found
 *       500:
 *         description: Failed to update post
 */
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const postId = new ObjectId(req.params.id);
        const userId = new ObjectId(req.user.userId);
        
        const post = await db.collection('posts').findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.authorId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only update your own posts" });
        }

        const { title, summary, imageUrl, mainCategory, categories, readingTime, link } = req.body;
        const updatedData = {
            title,
            summary,
            imageUrl,
            mainCategory,
            categories: categories.split(',').map(cat => cat.trim()),
            readingTime: parseInt(readingTime),
            link
        };

        await db.collection('posts').updateOne({ _id: postId }, { $set: updatedData });
        res.status(200).json({ message: "Post updated successfully" });

    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ message: "Failed to update post", error: err.message });
    }
});

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you can only delete your own posts
 *       404:
 *         description: Post not found
 *       500:
 *         description: Failed to delete post
 */
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const postId = new ObjectId(req.params.id);
        const userId = new ObjectId(req.user.userId);

        const post = await db.collection('posts').findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.authorId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own posts" });
        }

        await db.collection('posts').deleteOne({ _id: postId });
        res.status(200).json({ message: "Post deleted successfully" });

    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: "Failed to delete post", error: err.message });
    }
});


// ===== Serving HTML Pages =====

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the admin login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve the admin registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve the page to view user's blogs
app.get('/my-blogs', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-blogs.html'));
});

// Serve the page to edit a blog post
app.get('/edit-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'edit-post.html'));
});


// Start the server
app.listen(port, host, () => {
    console.log(`Test server je pokrenut na ${host}:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
}); 