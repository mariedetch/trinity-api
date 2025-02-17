import { setSeederFactory } from 'typeorm-extension';
import { CommandProduct } from '../../features/commands/command-product.entity';
import { Product } from '../../features/products/product.entity';

export const CommandProductFactory = setSeederFactory(
  CommandProduct,
  async (faker, meta?: { commandId: string; product: Product }) => {
    const commandProduct = new CommandProduct();

    commandProduct.command_id = meta.commandId;
    commandProduct.product_id = meta.product.id;
    commandProduct.quantity = faker.number.int({ min: 1, max: 5 });
    commandProduct.unit_price_excl = meta.product.selling_price;
    commandProduct.unit_price_incl = meta.product.selling_price * 1.18;
    commandProduct.total_price_excl =
    commandProduct.unit_price_excl * commandProduct.quantity;
    commandProduct.total_price_incl =
    commandProduct.unit_price_incl * commandProduct.quantity;

    return commandProduct;
  },
);
