import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Validator {
    constructor(protected ctx: HttpContextContract) { }


    public Schema = schema.create({
        email: schema.string([rules.required(), rules.email()]),
        password: schema.string([rules.minLength(8), rules.required()]),
    })

    public messages: CustomMessages = {
        'email.required': 'The email field is required',
        'email.email': 'The email must be a valid email address',
        'password.required': 'The password field is required',
        'password.minLength': 'The password must be at least 6 characters long',
    }

}