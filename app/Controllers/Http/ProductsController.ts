import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product';
import { Response } from 'App/Utils/ApiUtil';
import ProductValidator from 'App/Validators/ProductValidator';
import { PaginationUtil } from 'App/Utils/PaginationUtil';


export default class ProductsController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const product = await request.validate(ProductValidator)
            await Product.create(product)
            return response.send(Response({ message: 'Product is successfully added.' }))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async index({ response }: HttpContextContract) {
        try {
            const products = await Product.query().preload('category')
            const data = products.map((product) => {
                return {
                    id: product.id,
                    name: product.name,
                    category: product.category.name,
                    description: product.description,
                    story: product.story,
                    images: product.images,
                    size: product.size,
                    color: product.color,
                    discount: product.discount,
                    price: product.price,
                    quantity: product.quantity,
                    created_at: product.createdAt,
                    updated_at: product.updatedAt
                }
            })
            return response.send(Response(data))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }
    public async show({ params, response }: HttpContextContract) {
        try {
            const product = await Product.findOrFail(params.product?.id)
            return response.send(product);
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }
    public async update({ request, params, response }: HttpContextContract) {
        try {
            const product = await Product.findOrFail(params.id)
            const data = await request.validate(ProductValidator)
            await product.merge(data).save()
            return response.send(Response({ message: 'Product updated successfully' }))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const product = await Product.findOrFail(params.id)
            await product.delete()
            return response.send(Response({ message: 'Product Deleted Successfully' }))
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }


    public async pagination({ request, response }: HttpContextContract) {
        try {
            const { page, page_size, filter, sort } = request.body();
            const query = Product.query();
            const paginationOptions = {
                page: page,
                pageSize: page_size,
                filter,
                sort,
            };
            const paginatedData = await PaginationUtil(query, paginationOptions, response);
            return response.json(paginatedData);
        } catch (error) {
            console.log(error);
            return response.status(400).send(error)
        }
    }

}