import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from 'src/features/products/product.entity';
import axios from 'axios';
import { PRODUCT_CATEGORIES } from 'src/common/utils/constants';

export default class ProductSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const productRepository = dataSource.getRepository(Product);

    const currentPage = 1,
      fields = 'code,image_url,ingredients,nutriments,product_name',
      url = `https://world.openfoodfacts.org/api/v2/search?page=${currentPage}&page_size=10&fields=${fields}`;

    for (const category of PRODUCT_CATEGORIES) {
      const response = await axios.get<FoodFactResponse>(
        `${url}&categories_tags=${category.id}`,
      );

      for (const product of response.data.products) {
        try {
          if (product.product_name) {
            const existantProduct = await productRepository.existsBy({
              bar_code: parseInt(product.code),
            });

            if (!existantProduct) {
              const initial_cost = Math.floor(
                Math.random() * (1000 - 250000 + 1) + 250000,
              );

              await productRepository.insert({
                bar_code: parseInt(product.code),
                name: product.product_name,
                category: category.name,
                nutriments: product.nutriments ?? {},
                ingredients: product.ingredients ?? [],
                picture: product.image_url ?? '',
                quantity_in_stock: Math.floor(
                  Math.random() * (0 - 100 + 1) + 100,
                ),
                alert_threshold: 10,
                initial_cost,
                selling_price: initial_cost + 1200,
              });
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
}

export interface FoodFactResponse {
  products: {
    categories: string;
    code: string;
    image_url: string;
    ingredients: [];
    nutriments: object;
    product_name: string;
  }[];
}
