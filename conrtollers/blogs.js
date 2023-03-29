const blogsRouter = require('express').Router()
const Blog = require('../moduls/blog')

blogsRouter.get('/', async (request, response) => {
  const result = await Blog.find({}).populate('user', {username: 1, name: 1})
  response.json(result)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const user = request.user
  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    user.blogs = user.blogs.filter(a => a !== blog.id)
    await user.save()

    return response.status(204).end()
  }
  response
    .status(401)
    .json({ error: 'invalid user' })
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user
  if(!request.token) {
    response.status(401).json({ error: 'token missing' })
  }
  if(!request.user) {
    response.status(401).json({ error: 'token invalid'})
  }


  if (body.title && body.url) {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      user: user.id,
      url: body.url,
      likes: body.likes || 0
    })
  
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)  
  } else {
    response.status(400).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updateBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updateBlog)
})

module.exports = blogsRouter