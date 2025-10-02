/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'


export default Env.rules({
	HOST: Env.schema.string({ format: 'host' }),
	PORT: Env.schema.number(),
	APP_KEY: Env.schema.string(),
	APP_NAME: Env.schema.string(),
	DRIVE_DISK: Env.schema.enum(['local'] as const),
	NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
	DB_CONNECTION: Env.schema.string(),
	MYSQL_HOST: Env.schema.string({ format: 'host' }),
	MYSQL_PORT: Env.schema.number(),
	MYSQL_USER: Env.schema.string(),
	MYSQL_PASSWORD: Env.schema.string.optional(),
	MYSQL_DB_NAME: Env.schema.string(),
	
	// Stripe Configuration
	STRIPE_SECRET_KEY: Env.schema.string.optional(),
	STRIPE_API_VERSION: Env.schema.string.optional(),
	STRIPE_PUBLISHABLE_KEY: Env.schema.string.optional(),
	
	// JazzCash Configuration
	JAZZCASH_MERCHANT_ID: Env.schema.string.optional(),
	JAZZCASH_PASSWORD: Env.schema.string.optional(),
	JAZZCASH_SECRET_KEY: Env.schema.string.optional(),
	JAZZCASH_RETURN_URL: Env.schema.string.optional(),
	
	// Frontend URL
	FRONTEND_URL: Env.schema.string.optional(),
})
