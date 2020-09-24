const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('express').Router()
const jwt = require('jsonwebtoken')


app.get('/', async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  console.log("decoded token: ", decodedToken)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blogs = await Blog
    .find({"user": decodedToken.id}).populate()
  response.json(blogs)
})

app.post('/', async (request, response, next) => {
  const body = request.body
  const token = request.token

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  //const users = await User.find({})
  //const user = users[0]


  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)

})

app.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

app.delete('/:id', async (request, response, next) => {
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)
  const user = await User.findById(decodedToken.id)

  
  if (blog.user.toString() === user.id.toString()) {
    const removedBlog = await Blog.findByIdAndRemove(request.params.id)
    if (removedBlog) {
      response.json(removedBlog)
    } 
  }
  response.status(404).end()
})

app.put('/:id', async (request, response, next) => {
  const body = request.body
  console.log('body', body)
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  }
  const result = await Blog.findByIdAndUpdate(request.params.id, blog)
  if (result) {
    response.json(result)
  } else {
    response.status(404).end()
  }
})

module.exports = app
