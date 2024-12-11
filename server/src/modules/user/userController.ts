import { Router } from 'express'
import { userRepository } from './userRepository'

export const userController = Router()

userController.get(
  '/',
  async (req, res) => {
    res.send(
      await userRepository.find(),
    )
  },
)

userController.post(
  '/',
  async (req, res) => {
    res.send(
      await userRepository.save({
        login: req.body.login,
        password: req.body.password,
      }),
    )
  },
)

userController.get(
  '/:id',
  async (req, res) => {
    res.send(
      await userRepository.findOneBy({
        id: Number(req.params.id),
      }),
    )
  },
)
