import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const AuthValidator = schema.create({
  name: schema.string([rules.required()]),
  email: schema.string([rules.required(), rules.email()]),
  password: schema.string([rules.minLength(8), rules.required()]),
  role: schema.string({ trim: true }, [rules.required()]),
})

export const LoginValidator = schema.create({
  email: schema.string([rules.required(), rules.email()]),
  password: schema.string([rules.minLength(8), rules.required()]),
})

