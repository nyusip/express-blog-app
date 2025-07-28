const { Router } = require('express');
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const Blog = require('../models/blog');
const Comment = require("../models/comment");
const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve('./public/upload/');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage: storage });

// Add new blog page
router.get('/add-new', (req, res) => {
  return res.render('addBlog', { user: req.user });
});

// Create blog
router.post('/', upload.single('coverImage'), async (req, res) => {
  const { title, body } = req.body;
  const blog = new Blog({
    title,
    body,
    coverImageURL: `/upload/${req.file.filename}`,
    createdBy: req.user ? req.user._id : null
  });
  await blog.save();
  res.redirect('/');
});

// Add comment
router.post('/comment/:blogId', async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

// Single blog page (with comments)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('createdBy','fullName profileImageURL');
    
    if (!blog) return res.status(404).send("Blog not found");

    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy','fullName profileImageURL');
    res.render('blog', { user: req.user, blog, comments });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;


