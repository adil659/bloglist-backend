const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)

let token;
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)

  const newUser = {
    username: 'adil659',
    name: 'adil',
    password: 'adil1234',
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const loginCredentials = {
    username: 'adil659',
    password: 'adil1234'
  }
  const result = await api
    .post('/api/login')
    .send(loginCredentials)

  token = result.body.token
})

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  expect(titles).toContain(
    'Canonical string reduction'
  )
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "Harry Potter",
    author: "JK Rowling",
    url: "https://reacatterns.com/",
    likes: 9
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await helper.blogsInDb()
  const titles = response.map(r => r.title)

  expect(response).toHaveLength(helper.initialBlogs.length + 1)
  expect(titles).toContain(
    'Harry Potter'
  )
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: "Jarold",
    url: "www.go.com",
    likes: "55"
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const response = await helper.blogsInDb()

  expect(response).toHaveLength(helper.initialBlogs.length)
})

test('verify that id exists', async () => {
  const response = await helper.blogsInDb()
  response.forEach(item => expect(item.id).toBeDefined())

})

test('verify missing likes property', async () => {
  const newBlog = {
    title: "droyo",
    author: "Jarold",
    url: "www.go.com"
  }
  await api.post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const blogs = await helper.blogsInDb()

  const blog = blogs.find((blog) => blog.title === "droyo")

  expect(blog.likes).toBeDefined()
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: "Har",
    author: "Jarold",
    likes: "55"
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const response = await helper.blogsInDb()

  expect(response).toHaveLength(helper.initialBlogs.length)
})

test('delete blog', async () => {
  const newBlog = {
    title: "Har",
    author: "Jarold",
    url: "google.com",
    likes: "55"
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)

  const blogs = await helper.blogsInDb()

  const blog = blogs.find((blog) => blog.title === "Har")

  await api
    .delete(`/api/blogs/${blog.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  const response = await helper.blogsInDb()
  expect(response).toHaveLength(helper.initialBlogs.length)
})


test('update blog', async () => {

  const blogs = await helper.blogsInDb()

  const blog = blogs.find((blog) => blog.title === "React patterns")

  blog.title = "Rock Pot"

  await api
    .put(`/api/blogs/${blog.id}`)
    .send(blog)
    .expect(200)

  const response = await helper.blogsInDb()
  const titles = response.map((res) => res.title)
  expect(titles).toContain("Rock Pot")
})


afterAll(() => {
  mongoose.connection.close()
})