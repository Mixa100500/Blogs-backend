const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../moduls/blog')

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

const api = supertest(app)

test('blogs are returned as json', async () => {
  await api 
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a specific blog can be viewed', async () => {
  const blogs = await Blog.find({})
  const blogsAtStart = blogs.map(blog => blog.toJSON())
  
  const blogToView = blogsAtStart[0]

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
  expect(resultBlog.body).toEqual(blogToView)
})

describe('creating new blogs', () => {

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const blogs = await Blog.find({})
    const blogsAtEnd = blogs.map(blog => blog.toJSON())
    const titles = blogsAtEnd.map(r => r.title)
  
    expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain(
      'Canonical string reduction'
    )
  })

  test('if there are no likes then it si 0', async () => {
    const newBlog = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
    const blogs = await Blog.find({})
    const blogsAtEnd = blogs.map(blog => blog.toJSON())
    const lastBlogs = blogsAtEnd[initialBlogs.length]

    expect(lastBlogs.likes).toBe(0)
  })

  test('blog must contains title and url', async () => {
    const newBlog = {
      author: "Edsger W. Dijkstra",
      likes: 12
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    
    const blogs = await Blog.find({})
    const blogsAtEnd = blogs.map(b => b.toJSON())
    expect(blogsAtEnd).toHaveLength(initialBlogs.length)
  })
})

test('a blog cab be deleted', async () => {
  let blogs = await Blog.find({})
  const blogsAtStart = blogs.map(blog => blog.toJSON())

  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  blogs = await Blog.find({})
  const blogsAtEnd = blogs.map(blog => blog.toJSON())

  expect(blogsAtEnd).toHaveLength(
    initialBlogs.length - 1
  )

  const contents = blogsAtEnd.map(r => r.title)
  expect(contents).not.toContain(blogToDelete.title)
})


afterAll(async () => {
  await mongoose.connection.close()
})