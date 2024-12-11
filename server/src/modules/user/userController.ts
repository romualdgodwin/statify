import { Router } from 'express'
import { userRepository } from './userRepository'
import { createValidator } from 'express-joi-validation'
import Joi from 'joi'
import { expressjwt } from 'express-jwt'

export const userController = Router()

const validator = createValidator()

userController.use(
  expressjwt({
    secret: 'secret',
    algorithms: ['HS256'],
  }),
)

userController.get('/', async (req, res) => {
  res.send(await userRepository.find())
})

const createUserSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().optional(),
})
userController.post(
  '/',
  validator.body(createUserSchema),
  async (req, res) => {
    try {
      res.send(
        await userRepository.save({
          login: req.body.login,
          password: req.body.password,
          role: req.body.role ?? 'user',
        }),
      )
    } catch (error: any) {
      res.status(400).send({
        error: error.message,
        detail: error.detail,
      })
    }
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
