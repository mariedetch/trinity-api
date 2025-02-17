import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from 'src/features/users/user.entity';
import { Role } from 'src/features/users/enum';

export default class UserSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    // const userFactory = factoryManager.get(User);
    // await userFactory.saveMany(50);

    // const admin = await userFactory.make();
    // admin.role = Role.MANAGER
    // await userFactory.save(admin);
  }
}
