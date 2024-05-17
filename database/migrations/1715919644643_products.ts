import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE')
      table.string('name', 255).notNullable().unique()
      table.string('description').notNullable()
      table.string('story').notNullable()
      table.text('images').notNullable()
      table.integer('discount').notNullable()
      table.integer('price').notNullable()
      table.integer('quantity').notNullable()
      table.string('size').notNullable()
      table.string('color').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}