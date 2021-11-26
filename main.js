import express from "express"
import {engine} from "express-handlebars"
import path from "path"
import formidableMiddleware from "express-formidable"
import fs from "fs"

const app = express()
const PORT = 3000;
const reName = /(?:\.([^.]+))?$/;

let files = []
let id = 0;

app.set('views', path.join(path.resolve(), 'views'));
app.engine('hbs', engine({
  defaultLayout: 'main.hbs',
  extname: '.hbs',
  partialsDir: 'views/partials',
  helpers: {}
}));
app.set('view engine', 'hbs');

app.use(formidableMiddleware({
  uploadDir: path.join(path.resolve(), '/static/uploads/'),
  multiples: true
}))

app.get('/', function (req, res) {
  res.redirect('/upload')
})
app.get('/upload', function (req, res) {
  res.render('upload.hbs', {
    sideTitle: "multiupload",
  })
})
app.post('/upload', async function (req, res) {
  await Promise.all((Array.isArray(req.files.uploadedFiles) ? req.files.uploadedFiles: [req.files.uploadedFiles]).map(async (file) => {
    file.id = id++
    file.savedate = Date.now()
    const pos  = file.path.search('/static')
    file.path = file.path.substring(pos + 7)
    const ext = reName.exec(file.name)[1].toUpperCase()

    const fPatch = path.join(path.resolve(), `/static/gfx/${ext}.png`)

    console.log(file.name, ext, fPatch)
    if(fs.existsSync(fPatch)){
      file.img = ext
    }else {
      file.img = 'unknown'
    }
    files.push(file)
  }))

  res.redirect('/filemanager')
})

app.get('/filemanager', function (req, res) {
  res.render('filemanager.hbs', {
    sideTitle: "multiupload",
    sideText: "USUŃ DANE O PLIKACH Z TABLICY",
    files: files,
  })
})


app.get('/delete/:id', function (req, res) {
  console.log(files, req.params.id)
  files = files.filter(f => f.id !== parseInt(req.params.id))
  res.redirect('/filemanager')
})


app.get('/info/:id', function (req, res) {


    res.render('info.hbs', {
    sideTitle: "file info",
    file: files.find((f) => f.id === parseInt(req.params.id)),
  })
})

app.get('/reset', function (req, res) {
  files = []

  res.redirect('/upload')
})


app.use(express.static('static'))

app.listen(PORT, function () {
  console.log("started at port: " + PORT)
})

