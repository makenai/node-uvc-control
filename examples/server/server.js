const express = require('express')
const app = express()
const port = 3000
const UVCControl = require('../../')
const cam = new UVCControl()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/supported-controls', (req, res) => {
  res.send(cam.supportedControls)
})

app.get('/get/:control', (req, res) => {
  cam.get(req.params.control)
    .then(val => res.send(val))
    .catch(err => {
      console.error(err)
      res.status(500).send(err)
    })
})

app.get('/describe/:control', (req, res) => {
  const controlDescription = UVCControl.controls[req.params.control]
  controlDescription ? res.send(controlDescription) : res.status(500).send({
    error: `No control named ${req.params.control}`
  })
})

app.get('/range/:control', (req, res) => {
  cam.range(req.params.control)
    .then(range => res.send(range))
    .catch(err => {
      console.error(err)
      res.status(500).send(err)
    })
})

app.post('/set/:control/:values', (req, res) => {
  let values = req.params.values.split(',')
  console.log('setting', req.params.control, values)
  cam.set(req.params.control, ...values).then(vals => {
    res.send('ok')
  }).catch(err => {
    console.error(err)
    res.status(500).send(err)
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
