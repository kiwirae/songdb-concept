const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const hbs = require('hbs')

const port = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

const app = express()
const publicDirectoryPath = path.join(__dirname, '/public')
const viewsPath = path.join(__dirname, '/templates/views')
const partialsPath = path.join(__dirname, '/templates/partials')

app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
app.use(express.static(publicDirectoryPath))

const upload = multer()

const Song = mongoose.model('Song', {
    name: {
        type: String
    },
    audio: {
        type: Buffer
    }
})

app.get('/', async(req, res) => {
    const songs = await Song.find({})
    res.render('index', {
        songs
    })
})

app.post('/upload' , upload.single('upload'), async (req, res) => {
    console.log(req.file)
    const song = new Song({
        name: req.file.originalname,
        audio: req.file.buffer
    })
    await song.save()
    res.redirect('/')
})

app.get('/download/:name', async (req, res) => {
    const song = await Song.findOne({ name: req.params.name })
    // res.set('Content-Type', 'audio/mpeg')
    res.set({
        'Content-Disposition': `attachment; filename=${song.name}`,
        'Content-Type': 'audio/mpeg'
    })
    res.send(song.audio)
})

app.listen(port, () => {
    console.log(`Server is up on port: ${port}`)
})