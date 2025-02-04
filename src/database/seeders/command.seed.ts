import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Command } from '../../features/commands/command.entity';
import { Product } from '../../features/products/product.entity';
import { CommandProduct } from '../../features/commands/command-product.entity';
import { User } from '../..//features/users/user.entity';
import { Role } from 'src/features/users/enum';

export default class CommandProductSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // const userRepository = dataSource.getRepository(User)
    // const productRepository = dataSource.getRepository(Product)
    // const commandRepository = dataSource.getRepository(Command)
    // const commandFactory = factoryManager.get(Command)
    // const commandProductFactory = factoryManager.get(CommandProduct)
    // const skip = Math.floor(Math.random() * (1 - 20 + 1) + 20)
    // const take = Math.floor(Math.random() * (1 - 5 + 1) + 5)
    // const customers = await userRepository.find({
    //   where: { role: Role.CUSTOMER },
    //   skip: skip,
    //   take: 5
    // });
    // for (const customer of customers) {
    //   commandFactory.setMeta({ user: customer })
    //   const command = await commandFactory.save()
    //   const products = await productRepository.find({
    //     skip: skip,
    //     take: take
    //   });
    //   for (const product of products) {
    //     commandProductFactory.setMeta({ commandId: command.id, product: product })
    //     const item = await commandProductFactory.save()
    //     command.total_price_excl += item.total_price_excl
    //     command.total_price_incl += item.total_price_incl
    //   }
    //   commandRepository.save(command)
    // }
  }
}
