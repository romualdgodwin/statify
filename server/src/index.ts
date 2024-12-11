import express from 'express'
import { AppDataSource } from './dataSource'
import { userController } from './modules/user/userController'
import { authController } from './modules/auth/authController'

const app = express()

app.use(express.json())
app.get('/', (req, res) => {
  res.send('Plop!')
})

app.use('/users', userController)
app.use('/auth', authController)

AppDataSource.initialize().then(() => {
  app.listen(3000)
})
