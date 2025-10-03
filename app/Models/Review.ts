import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'

export default class Review extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'product_id', serializeAs: 'productId' })
  public productId: number

  @column()
  public rating: string

  @column()
  public description: string

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Product)
  public product: BelongsTo<typeof Product>
}
