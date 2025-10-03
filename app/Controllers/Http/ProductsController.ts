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
      product.story = data.story || '';
      product.sizes = JSON.stringify(data.sizes || '');
      product.colors = JSON.stringify(data.colors || '');
      product.discount = data.discount || 0;
      product.price = data.price;
      product.quantity = data.quantity;
      await product.save();
      const images = request.files('path')
      let productImages: ProductImage[] = [];
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
          images: product.images ? product.images.map((image) => ({
            id: image.id,
            path: image.path,
            productId: image.productId
          })) : [],
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
            images: product.images ? product.images.map((image) => ({
              id: image.id,
              path: image.path,
              productId: image.productId
            })) : [],
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
            
            // Update all product fields
            product.name = data.name
            product.categoryId = data.category_id
            product.description = data.description
            product.story = data.story || ''
            product.sizes = JSON.stringify(data.sizes || '')
            product.colors = JSON.stringify(data.colors || '')
            product.discount = data.discount || 0
            product.price = data.price
            product.quantity = data.quantity
            await product.save()
            
            // Handle multiple image uploads if provided
            const images = request.files('path')
            let productImages: ProductImage[] = []
            
            if (images && images.length > 0) {
                for (let image of images) {
                    await image.move(Application.tmpPath("uploads"), {
                        name: `${Date.now()}-${image.clientName}`,
                    })

                    let productImage = new ProductImage()
                    productImage.productId = product.id
                    productImage.path = `uploads/${image.fileName}`
                    await productImage.save()

                    productImages.push(productImage)
                }
            }
            
            // Reload product with images for response
            await product.load('images')
            const updatedData = {
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
                images: product.images ? product.images.map((image) => ({
                  id: image.id,
                  path: image.path,
                  productId: image.productId
                })) : [],
            }
            
            return response.send(Response('Product Updated Successfully', updatedData))
        } catch (error) {
            console.log(error)
            return response.status(400).send(error)
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

      // Transform the paginated results
      const transformedData = {
        meta: results.getMeta(),
        data: results.all().map((product) => {
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
            images: product.images ? product.images.map((image) => ({
              id: image.id,
              path: image.path,
              productId: image.productId
            })) : [],
            created_at: product.createdAt,
            updated_at: product.updatedAt,
          }
        })
      }

      return response.send(Response('Get All Products with Pagination', transformedData))
    } catch (error) {
      console.log(error)
      return response.status(500).send(Response('internal server error', error))
    }
  }

    public async deleteImage({ params, response }: HttpContextContract) {
        try {
            const productImage = await ProductImage.findOrFail(params.id)
            
            // Path is already stored as 'uploads/filename', so just use tmpPath directly
            const imagePath = Application.tmpPath(productImage.path as string)
            
            // Try to delete the file from filesystem (don't fail if file doesn't exist)
            try {
                await fs.unlink(imagePath)
            } catch (fileError) {
                console.log('File not found or already deleted:', imagePath)
            }
            
            // Always delete the database record
            await productImage.delete()
            
            return response.send(Response('Product Image Deleted Successfully', {
                id: productImage.id,
                path: productImage.path
            }))
        } catch (error) {
            console.log('Error deleting image:', error)
            return response.status(404).send(Response('Product image not found', error))
        }
    }

    // Search products by keyword
    public async search({ request, response }: HttpContextContract) {
        try {
            const { q } = request.qs()
            
            if (!q) {
                return response.status(400).json({ 
                    message: 'Search query parameter "q" is required' 
                })
            }

            const products = await Product.query()
                .where('name', 'like', `%${q}%`)
                .orWhere('description', 'like', `%${q}%`)
                .preload('images')
                .orderBy('created_at', 'desc')

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
                    images: product.images ? product.images.map((image) => ({
                        id: image.id,
                        path: image.path,
                        productId: image.productId
                    })) : [],
                    created_at: product.createdAt,
                    updated_at: product.updatedAt,
                }
            })

            return response.send(Response(`Found ${data.length} products`, data))
        } catch (error) {
            console.log(error)
            return response.status(500).send(error)
        }
    }

    // Get products by category
    public async getByCategory({ params, response }: HttpContextContract) {
        try {
            const categoryId = params.id

            const products = await Product.query()
                .where('category_id', categoryId)
                .preload('images')
                .orderBy('created_at', 'desc')

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
                    images: product.images ? product.images.map((image) => ({
                        id: image.id,
                        path: image.path,
                        productId: image.productId
                    })) : [],
                    created_at: product.createdAt,
                    updated_at: product.updatedAt,
                }
            })

            return response.send(Response(`Found ${data.length} products in category`, data))
        } catch (error) {
            console.log(error)
            return response.status(500).send(error)
        }
    }
}


