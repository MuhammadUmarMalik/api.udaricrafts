import { DateTime } from 'luxon'
import { BaseModel, hasMany, HasMany, column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'
import slugify from 'slugify'
export default class Category extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public slug: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async createSlug(category: Category) {
    if (category.$dirty.name) {
      category.slug = slugify(category.name, { lower: true })
    }
  }

  @hasMany(() => Product)
  public products: HasMany<typeof Product>
}