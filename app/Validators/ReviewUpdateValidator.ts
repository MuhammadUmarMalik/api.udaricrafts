import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ReviewUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  /**
   * Validator for updating reviews (typically just status updates by admins)
   * All fields are optional so admins can update just the status
   */
  public schema = schema.create({
    rating: schema.string.optional(),
    description: schema.string.optional(),
    name: schema.string.optional(),
    email: schema.string.optional(),
    status: schema.string.optional(),
    product_id: schema.number.optional(),
  })

  public messages: CustomMessages = {
    'email.email': 'The email must be a valid email address.',
  }
}

