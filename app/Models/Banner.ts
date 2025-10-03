import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Banner extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public image: string

  @column.dateTime({ autoCreate: true, serializeAs: 'createdAt' })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: 'updatedAt' })
  public updatedAt: DateTime
}
