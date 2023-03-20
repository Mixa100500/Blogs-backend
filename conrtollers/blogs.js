const blogsRouter = require('express').Router()
const Blog = require('../moduls/blog')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if((body.title && body.url)) {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0
    })
  
    blog.save()
      .then(result => {
        response.status(201).json(result)
      })
      
  } else {
    response.status(400).end()
  }
})

module.exports = blogsRouter