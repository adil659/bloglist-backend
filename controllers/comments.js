const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/Comment')

const app = require('express').Router()
const jwt = require('jsonwebtoken')
const { request } = require('express')

app.post('/', async (request, response, next) => {
    const body = request.body
    const blogId = body.blogId
    console.log("blog id is: ", blogId)
    const blog = await Blog.findById(blogId)

    const comment = new Comment({
        comment: body.commentObject.comment,
        blog: body.blogId
    })
    const savedComment = await comment.save()

    blog.comments = blog.comments.concat(savedComment._id)
    await blog.save()

    response.status(201).json(savedComment)
})


module.exports = app
