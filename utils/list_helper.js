const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    var total = 0
    blogs.forEach((blog) => total = total + blog.likes)

    return total
}

const favoriteBlog  = (blogs) => {
    var highestLikes = 0
    var favoriteBlog = {}
    blogs.forEach((blog) => {
        if (blog.likes > highestLikes) {
            highestLikes = blog.likes
            favoriteBlog = blog
        }
    })
    return favoriteBlog
}
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
  }