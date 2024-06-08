import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'payment_details'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE')
      table.integer('amount')
      table.string('type')
      table.string('status').defaultTo('pending')
      table.string('stripe_session_id')
      table.string('jazzCashTransactionId')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       * payment_details (order_id (FK), amount, type (cash, card), status (pending, paid), timestamps)

       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
