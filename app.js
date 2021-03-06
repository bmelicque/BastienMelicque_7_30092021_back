const express = require('express');
require('dotenv').config({path: './config/.env'});
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');

const app = express();

// Setting headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());
app.use(cookieParser());

app.use('/images', express.static(path.join(__dirname, '/images')));
app.use('/api/auth/', authRoutes);
app.use('/api/user/', userRoutes);
app.use('/api/post/', postsRoutes);
app.use('/api/comment/', commentsRoutes);

module.exports = app;