import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'

export default class ProductImage extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  productId: number

  @column()
  path: String

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // @hasMany(() => Product)
  // public product: HasMany<typeof Product>
  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>
}
