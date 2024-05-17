import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
export default class AdminAuth {
    public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
        try {
            const user = auth.user?.role
            if (!user || user !== 'superadmin') {
                return response.unauthorized({ error: 'Role Base Authorization Failed' });
            }
            await next();
        } catch (error) {
            return response.status(400).send(error);
        }
    }
}