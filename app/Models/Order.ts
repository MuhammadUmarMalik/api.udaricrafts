import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import OrderItem from './OrderItem'
import PaymentDetail from './PaymentDetail'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public order_number: string

  @column()
  public total: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public phone: string

  @column()
  public address: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => OrderItem, {
    foreignKey: 'orderId'
  })
  public orderItems: HasMany<typeof OrderItem>

  @hasMany(() => PaymentDetail, {
    foreignKey: 'orderId'
  })
  public paymentDetails: HasMany<typeof PaymentDetail>
}
