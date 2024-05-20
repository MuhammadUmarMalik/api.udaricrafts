import { Response } from 'App/Utils/ApiUtil';
// app/Controllers/Http/AuthController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'


export default class AuthController {
    public async register({ auth, request, response }: HttpContextContract) {
        const { name, email, password, role } = request.only(['name', 'email', 'password', 'role'])
        const user = new User()
        user.name = name
        user.email = email
        user.password = password
        user.role = role
        await user.save()
        const token = await auth.use('api').generate(user)
        return response.send(Response('User Register Successfully', { user, token }))
    }

    public async login({ request, response, auth }: HttpContextContract) {
        const email = request.input('email')
        const password = request.input('password')
        try {
            const user = await User.findBy('email', email)
            if (!user || !(await Hash.verify(user.password, password))) {
                return response.status(401).json({ message: 'Invalid credentials' })
            }
            const token = await auth.use('api').attempt(email, password, {
                expiresIn: '5 days',
            })
            return response.send(Response('User Login Successfully', { user, token }))
        } catch (error) {
            return response.status(500).json({ error: { message: 'Internal server error' } })
        }
    }

    public async getAllExceptCurrent({ auth, response }: HttpContextContract) {
        try {
            const currentUser = auth.user
            if (!currentUser) {
                return {
                    message: 'User not authenticated',
                }
            }
            const users = await User.query().whereNot('id', currentUser.id)
            return response.send(Response('User Login Successfully', users))
        } catch (error) {
            return response.status(500).json({ error: { message: 'Internal server error' } })

        }
    }


    public async update({ params, request, response }: HttpContextContract) {
        const user = await User.find(params.id)
        if (!user) {
            return response.notFound({ message: 'User not found' })
        }
        const { name, password } = request.only(['name', 'password'])
        user.name = name
        if (password) {
            user.password = password
        }
        await user.save()
        return response.send(Response('User Updated Successfully', user))
    }

    public async destroy({ params, response }: HttpContextContract) {
        const user = await User.find(params.id)
        if (!user) {
            return response.notFound({ message: 'User not found' })
        }
        await user.delete()
        return response.send(Response('User Deleted Successfully', user))
    }
}
