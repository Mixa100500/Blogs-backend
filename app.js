const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./conrtollers/blogs')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

app.use('/api/blogs', blogsRouter)

logger.info('connected to', config.MONGODB_URL)
mongoose.connect(config.MONGODB_URL)

app.use(cors())
app.use(express.json())

module.exports = app