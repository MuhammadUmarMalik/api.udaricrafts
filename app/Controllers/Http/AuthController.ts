import { Response } from 'App/Utils/ApiUtil';
// app/Controllers/Http/AuthController.ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import { AuthValidator, LoginValidator } from 'App/Validators/AuthValidator';


export default class AuthController {
    public async register({ auth, request, response }: HttpContextContract) {
        try {

            await request.validate({ schema: AuthValidator })

            const { name, email, password, role } = request.only(['name', 'email', 'password', 'role'])
            const user = new User()
            user.name = name
            user.email = email
            user.password = password
            user.role = role || 'user'
            await user.save()
            const token = await auth.use('api').generate(user)
            // Return user data without password
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
            return response.send(Response('User Register Successfully', { user: userData, token }))
        } catch (error) {
            console.error(error)
        }
    }
    public async login({ request, response, auth }: HttpContextContract) {
        await request.validate({ schema: LoginValidator })
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
            // Return user data without password
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
            return response.send(Response('User Login Successfully', { user: userData, token }))
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

    // Get current user profile
    public async getProfile({ auth, response }: HttpContextContract) {
        try {
            const user = auth.user
            if (!user) {
                return response.status(401).json({ message: 'User not authenticated' })
            }
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
            return response.send(Response('Profile fetched successfully', userData))
        } catch (error) {
            return response.status(500).json({ error: { message: 'Internal server error' } })
        }
    }

    // Update current user profile
    public async updateProfile({ auth, request, response }: HttpContextContract) {
        try {
            const user = auth.user
            if (!user) {
                return response.status(401).json({ message: 'User not authenticated' })
            }
            const { name, email } = request.only(['name', 'email'])
            
            // Check if email is already taken by another user
            if (email && email !== user.email) {
                const existingUser = await User.findBy('email', email)
                if (existingUser) {
                    return response.status(400).json({ message: 'Email already in use' })
                }
            }
            
            if (name) user.name = name
            if (email) user.email = email
            await user.save()
            
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
            return response.send(Response('Profile updated successfully', userData))
        } catch (error) {
            return response.status(500).json({ error: { message: 'Internal server error' } })
        }
    }

    // Change password
    public async changePassword({ auth, request, response }: HttpContextContract) {
        try {
            const user = auth.user
            if (!user) {
                return response.status(401).json({ message: 'User not authenticated' })
            }
            
            const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])
            
            if (!currentPassword || !newPassword) {
                return response.status(400).json({ message: 'Current and new password are required' })
            }
            
            // Verify current password
            const isValidPassword = await Hash.verify(user.password, currentPassword)
            if (!isValidPassword) {
                return response.status(400).json({ message: 'Current password is incorrect' })
            }
            
            // Update password
            user.password = newPassword
            await user.save()
            
            return response.send(Response('Password changed successfully', null))
        } catch (error) {
            return response.status(500).json({ error: { message: 'Internal server error' } })
        }
    }

    // Logout and invalidate token
    public async logout({ auth, response }: HttpContextContract) {
        try {
            await auth.use('api').revoke()
            return response.send(Response('Logout successful', null))
        } catch (error) {
            return response.status(500).json({ error: { message: 'Internal server error' } })
        }
    }

    // Reset password with token
    public async resetPassword({ request, response }: HttpContextContract) {
        try {
            const { email, token, newPassword } = request.only(['email', 'token', 'newPassword'])
            
            if (!email || !token || !newPassword) {
                return response.status(400).json({ message: 'Email, token and new password are required' })
            }
            
            const user = await User.findBy('email', email)
            if (!user) {
                return response.status(404).json({ message: 'User not found' })
            }
            
            // Here you would verify the reset token
            // For now, we'll implement a basic version
            // In production, you should store reset tokens in a separate table with expiry
            
            user.password = newPassword
            await user.save()
            
            return response.send(Response('Password reset successfully', null))
        } catch (error) {
            return response.status(500).json({ error: { message: 'Internal server error' } })
        }
    }
}
