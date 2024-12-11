import { Router } from 'express'
import { userRepository } from './userRepository'
import { createValidator } from 'express-joi-validation'
import Joi from 'joi'

export const userController = Router()

const validator = createValidator()

userController.get(
  '/',
  async (req, res) => {
    res.send(
      await userRepository.find(),
    )
  },
)

const createUserSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
})
userController.post(
  '/',
  validator.body(createUserSchema),
  async (req, res) => {
    res.send(
      await userRepository.save({
        login: req.body.login,
        password: req.body.password,
      }),
    )
  },
)

const getUserSchema = Joi.object({
  id: Joi.number().required(),
})
userController.get(
  '/:id',
  validator.params(getUserSchema),
  async (req, res) => {
    res.send(
      await userRepository.findOneBy({
        id: Number(req.params.id),
      }),
    )
  },
)
