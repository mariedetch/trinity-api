import { setSeederFactory } from 'typeorm-extension';
import { Command } from '../../features/commands/command.entity';
import { CommandStatus } from '../../features/commands/enums';
import { User } from '../../features/users/user.entity';

export const CommandFactory = setSeederFactory(Command, async (faker, meta?: { user: User }) => {
  const command = new Command();

  command.id = faker.string.uuid();
  command.user_id = meta.user.id;
  command.reference = faker.string.alphanumeric(10).toUpperCase();
  command.shipping_address = meta.user.addresses.at(0);
  command.status = faker.helpers.arrayElement([
    CommandStatus.PAID,
    CommandStatus.IN_PROGRESS,
    CommandStatus.SHIPPED,
    CommandStatus.DELIVERED
  ]);

  command.meta_data = {
    paid_at: faker.date.recent(),
    validated_at: undefined,
    shipped_at: undefined,
    delivered_at: undefined,
  }

  if (command.status != CommandStatus.PAID) {
    command.shipping_charge = faker.number.float({ min: 1000, max: 10000, precision: 0.01 });
    command.meta_data.validated_at = faker.date.recent()

    if (command.status == CommandStatus.SHIPPED) {
      command.meta_data.shipped_at = faker.date.recent()
    }

    if (command.status == CommandStatus.DELIVERED) {
      command.meta_data.delivered_at = faker.date.recent()
    }
  }

  return command;
});
