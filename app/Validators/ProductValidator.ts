import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProductValidator {
  constructor(protected ctx: HttpContextContract) { }

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    
   *     schema.string({}, [ rules.alpha() ])
   *    
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    
   */
  public schema = schema.create({
    name: schema.string([
      rules.required(),
    ]),
    category_id: schema.number([rules.required()]),
    description: schema.string([rules.required()]),
    story: schema.string([rules.required()]),
    images: schema.string([rules.required()]),
    size: schema.string([rules.required()]),
    color: schema.string([rules.required()]),
    discount: schema.number([rules.required()]),
    price: schema.number([rules.required()]),
    quantity: schema.number([rules.required()]),

  })

  /**
   * Custom messages for validation failures. You can make use of dot notation (.)
   * for targeting nested fields and array expressions (*) for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    'name.required': 'The name cannot be empty.',
    'category_id.required': 'The category_id cannot be empty.',
    'description.required': 'The description cannot be empty',
    'story.required': 'The story cannot be empty',
    'images.required': 'The image cannot be empty',
    'discount.required': 'The discount cannot be empty',
    'size.required': 'The size cannot be empty',
    'color.required': 'The color cannot be empty',
    'price.required': 'The price cannot be empty.',
    'quantity.required': 'The quantity cannot be empty.',
  }
}