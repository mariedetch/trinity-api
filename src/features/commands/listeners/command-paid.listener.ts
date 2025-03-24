import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommandPaidEvent } from '../events/command-paid.event';
import { DataSource, In } from 'typeorm';
import { Command } from 'src/features/commands/command.entity';
import { CommandStatus } from 'src/features/commands/enums';
import { Product } from 'src/features/products/product.entity';
import { CommandProduct } from 'src/features/commands/command-product.entity';
import { Payment } from 'src/features/payments/payment.entity';
import { PaymentStatus } from 'src/features/payments/payment.enum';

@Injectable()
export class CommandPaidListener {
  private readonly logger = new Logger(CommandPaidListener.name);

  constructor(private dataSource: DataSource) {}

  @OnEvent('order.paid', { async: true })
  async handleCommandPaidEvent(event: CommandPaidEvent) {
    this.logger.log(`Order paid handled successfully`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mettre à jour le statut de la commande
      const command = await queryRunner.manager.update(
        Command,
        event.command.id,
        { status: CommandStatus.PAID },
      );

      // Mettre à jour le stock des produits
      const commandItems = await queryRunner.manager.find(CommandProduct, {
        where: { command_id: event.command.id },
        relations: ['product'],
      });

      commandItems.forEach(async (commandItem) => {
        await queryRunner.manager.decrement(
          Product,
          { id: commandItem.product.id },
          'quantity_in_stock',
          commandItem.quantity,
        );
      });

      await queryRunner.manager.save(Payment, {
        customer_id: event.command.user_id,
        command_id: event.command.id,
        amount: event.command.total_price_incl,
        payment_method: event.method,
        status: PaymentStatus.PAID,
      });

      queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error(`An error happened: ${error}`);
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
