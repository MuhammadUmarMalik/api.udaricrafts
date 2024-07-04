import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Product from "App/Models/Product";
import { Response } from "App/Utils/ApiUtil";
import ProductValidator from "App/Validators/ProductValidator";
import Application from "@ioc:Adonis/Core/Application";
import ProductImage from "App/Models/ProductImage";
import fs from 'fs/promises'
export default class ProductsController {
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = await request.validate(ProductValidator);
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
      const images = request.files('path')
      let productImages = [] 
      for (let image of images) {
        await image.move(Application.tmpPath("uploads"), {
          name: `${Date.now()}-${image.clientName}`,
        });

        let productImage = new ProductImage();
        productImage.productId = product.id;
        productImage.path = `uploads/${image.fileName}`;
        await productImage.save();

        productImages.push(productImage);
      }

      return response.send(
        Response("Product Created Successfully", { product, productImages })
      );
    } catch (error) {
      return response.status(400).send(error);
    }
  }

  public async index({ response }: HttpContextContract) {
    try {
      const products = await Product.query().preload('images');
      const data = products.map((product) => {
        return {
          id: product.id,
          name: product.name,
          category: product.categoryId,
          description: product.description,
          story: product.story,
          size: product.sizes,
          color: product.colors,
          discount: product.discount,
          price: product.price,
          quantity: product.quantity,
          images: product.images ? product.images.map((image) => image.path) : [],
          created_at: product.createdAt,
          updated_at: product.updatedAt,
        };
      });
      return response.send(Response("Get All Products Successfully", data));
    } catch (error) {
      console.log(error)
      return response.status(400).send(error);
    }
  }

    public async show({ params, response }: HttpContextContract) {
        try {
          const product = await Product.query()
            .where('id', params.id)
            .preload('images')
            .firstOrFail();

          const data = {
            id: product.id,
            name: product.name,
            category: product.categoryId,
            description: product.description,
            story: product.story,
            size: product.sizes,
            color: product.colors,
            discount: product.discount,
            price: product.price,
            quantity: product.quantity,
            images: product.images ? product.images.map((image) => image.path) : [],
            created_at: product.createdAt,
            updated_at: product.updatedAt,
          };

            return response.send(
              Response("Get Specified Product Successfully", data)
            );
        } catch (error) {
            return response.status(400).send(error);
        }
    }
    public async update({ request, params, response }: HttpContextContract) {
        try {
            const product = await Product.findOrFail(params.id)
            const data = await request.validate(ProductValidator)
            await product.merge({
                name: data.name,
                description: data.description,
                price: data.price,
            }).save()
            const image = request.file("path")
            let productImages = new ProductImage()
            if (image) {
                await image.move(Application.tmpPath('uploads'), {
                    name: `${Date.now()}-${image.clientName}`
                })
                const previousImage = Application.tmpPath(`uploads/${image.fileName}`)
                await fs.unlink(previousImage)
                await productImages.merge({
                    path: image.fileName
                })
            }
            return response.send(Response('Product Updated Successfully', { product, productImages }))
        } catch (error) {
            return response.send(error);
        }
    }
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const product = await Product.findOrFail(params.id);
      await product.delete();
      return response.send(Response("Product Deleted Successfully", product));
    } catch (error) {
      return response.status(400).send(error);
    }
  }



  public async pagination({ request, response }: HttpContextContract) {
    try {
      const { date, name, categoryID } = request.qs()
      let query = Product.query().preload('images')

      if (date) {
        query = query.where('created_at', date)
      }

      if (name) {
        query = query.where('name', 'like', `%${name}%`)
      }

      if (categoryID) {
        query = query.where('category_id', categoryID)
      }

      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const results = await query.paginate(page, limit)

      results.map((product) => {
        return {
          id: product.id,
          name: product.name,
          category: product.categoryId,
          description: product.description,
          story: product.story,
          size: product.sizes,
          color: product.colors,
          discount: product.discount,
          price: product.price,
          quantity: product.quantity,
          images: product.images ? product.images.map((image) => image.path) : [], // Include image paths
          created_at: product.createdAt,
          updated_at: product.updatedAt,
        };
      });

      return response.send(Response('Get All Products with Pagination', results))
    } catch (error) {
      console.log(error)
      return response.status(500).send(Response('internal server error', error))
    }
  }

    public async deleteImage({ params, response }: HttpContextContract) {
        try {
            const productImage = await ProductImage.findOrFail(params.id)
            const image = Application.tmpPath(`uploads/${productImage.path}`)
            await fs.unlink(image)
            await productImage.delete()
            return response.send(Response('Product Image Deleted Successfully', productImage))
        } catch (error) {
            console.log(error)
            return response.status(400).send(error)
        }
    }
}


