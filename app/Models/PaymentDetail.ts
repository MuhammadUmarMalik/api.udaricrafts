import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Order from './Order'

export default class PaymentDetail extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public orderId: number

  @column()
  public amount: number

  @column()
  public type: string

  @column()
  public status: string

  @column({ columnName: 'stripe_session_id' })
  public stripeSessionID: string

  @column({ columnName: 'jazzCashTransactionId' })
  public jazzCashTransactionId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Order)
  public order: BelongsTo<typeof Order>
}
