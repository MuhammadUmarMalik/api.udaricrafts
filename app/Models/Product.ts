import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Category from './Category'
import Review from './Review'
import OrderItem from './OrderItem'
import ProductImage from './ProductImage'
// import Order from './Order'
// import Sale from './Sale'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public categoryId: number

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public story: string

  @column()
  public discount: number

  @column()
  public price: number

  @column()
  public quantity: number

  @column()
  public sizes: string

  @column()
  public colors: string


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Category)
  public category: BelongsTo<typeof Category>

  @hasMany(() => OrderItem)
  public orderItems: HasMany<typeof OrderItem>

  @hasMany(() => Review)
  public reviews: HasMany<typeof Review>

  @hasMany(() => ProductImage)
  public images: HasMany<typeof ProductImage>

}