import express from 'express'
import { AppDataSource } from './dataSource'
import { userController } from './modules/user/userController'

const app = express()

app.use(express.json())
app.get('/', (req, res) => {
  res.send('Plop!')
})
app.post('/login', (req, res) => {
  if (
    req.body.password === 'test' &&
    req.body.login === 'test'
  ) {
    res.send('Connected!')
  } else {
    res.sendStatus(401)
  }
})

app.use('/users', userController)

AppDataSource.initialize().then(() => {
  app.listen(3000)
})
