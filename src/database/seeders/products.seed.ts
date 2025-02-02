import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from 'src/features/products/product.entity';
import axios from 'axios';

export default class ProductSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // const productRepository = dataSource.getRepository(Product);

    // const fields = "code,categories,image_url,ingredients,nutriments,product_name"
    // const response = await axios.get<FoodFactResponse>(`https://world.openfoodfacts.org/api/v2/search?page_size=50&fields=${fields}`)

    // for (const product of response.data.products) {
    //   const initial_cost = Math.floor(Math.random() * (1000 - 250000 + 1) + 250000)

    //   const item = await productRepository.insert({
    //     bar_code: parseInt(product.code),
    //     name: product.product_name,
    //     category: 'Chocolate',
    //     nutriments: product.nutriments ?? {},
    //     ingredients: product.ingredients ?? [],
    //     picture: product.image_url ?? '',
    //     quantity_in_stock: Math.floor(Math.random() * (0 - 100 + 1) + 100),
    //     alert_threshold: 10,
    //     initial_cost,
    //     selling_price: initial_cost + 1200
    //   });
    // }
  }
}

export interface FoodFactResponse {
  products: {
    categories: string,
    code: string,
    image_url: string,
    ingredients: [],
    nutriments: {},
    product_name: string
  }[]
}