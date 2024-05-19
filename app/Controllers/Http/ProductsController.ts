import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Product from 'App/Models/Product';
import { Response } from 'App/Utils/ApiUtil';
import ProductValidator from 'App/Validators/ProductValidator';
import { PaginationUtil } from 'App/Utils/PaginationUtil';
import ProductImage from 'App/Models/ProductImage';
export default class ProductsController {
    public async store({ request, response }: HttpContextContract) {
        try {
            const data = await request.validate(ProductValidator)
            let product = new Product();
            product.name = data.name;
            product.categoryId = data.category_id;
            product.description = data.description;
            product.story = data.story;
            product.sizes = JSON.stringify(data.sizes);
            product.colors = JSON.stringify(data.colors);
            product.discount = data.discount;
            product.price = data.price;
            product.quantity = data.quantity;
            await product.save();

            let productImages = new ProductImage()
            await data.path.moveToDisk(('uploads'), {
                name: `${Date.now()}-${data.path.clientName}`,

            })
            productImages.productId = product.id;
            productImages.path = JSON.stringify(data.path.fileName);
            await productImages.save()
            return response.send(Response({ message: 'Product is successfully added.', product, productImages }))
        } catch (error) {
            console.log(error)
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
                    size: product.sizes,
                    color: product.colors,
                    discount: product.discount,
                    price: product.price,
                    quantity: product.quantity,
                    created_at: product.createdAt,
                    updated_at: product.updatedAt
                }
            })

            return response.send(Response(data))
        } catch (error) {

            return response.status(400).send(error)
        }
    }
    public async show({ params, response }: HttpContextContract) {
        try {
            const product = await Product.findOrFail(params.id)
            return response.send(product);
        } catch (error) {
            return response.status(400).send(error)
        }
    }
    public async update({ request, params, response }: HttpContextContract) {
        try {
            const product = await Product.findOrFail(params.id)
            const data = await request.validate(ProductValidator)
            await product.merge(data).save()
            return response.send(Response({ message: 'Success', product }))
        } catch (error) {

            return response.status(400).send(error)
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            const product = await Product.findOrFail(params.id)
            await product.delete()
            return response.send(Response({ message: 'Success', product }))
        } catch (error) {

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
            return response.status(400).send(error)
        }
    }
}