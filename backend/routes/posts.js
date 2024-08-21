// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Create a new post
router.post('/', auth, async (req, res) => {
    const { title, content } = req.body;

    try {
        const newPost = new Post({
            title,
            content,
            author: req.user.id,
        });

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', ['username']);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', ['username']);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update a post by ID
router.put('/:id', auth, async (req, res) => {
    const { title, content } = req.body;

    try {
        let post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        post = await Post.findByIdAndUpdate(req.params.id, { title, content }, { new: true });

        res.json(post);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a post by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ msg: 'Post not found' });

        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Post.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Post removed' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
