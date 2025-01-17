import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Complaint extends BaseModel {
  @column({ isPrimary: true })
  public id: number
  @column()
  public name: string

  @column()
  public email: string

  @column()
  public phone: string

  @column()
  public description: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
