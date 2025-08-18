import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async withTransaction<T>(
    work: (session: ClientSession) => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let attempt = 0;

    while (attempt < maxRetries) {
      const session = await this.connection.startSession();
      session.startTransaction();

      try {
        const result = await work(session);

        await session.commitTransaction();
        session.endSession();
        return result;
      } catch (error: any) {
        await session.abortTransaction();
        session.endSession();

        if (
          error.hasErrorLabel &&
          (error.hasErrorLabel('TransientTransactionError') ||
            error.hasErrorLabel('UnknownTransactionCommitResult'))
        ) {
          attempt++;
          this.logger.warn(
            `Transient transaction error detected, retrying attempt ${attempt}...`,
          );
          continue;
        }

        throw error;
      }
    }

    throw new Error(
      `Transaction failed after ${maxRetries} retries due to transient errors`,
    );
  }
}
