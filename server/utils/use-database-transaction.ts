import type { Transaction } from 'sequelize'

/**
 * Creates a database transaction.
 *
 * @returns A Sequelize transaction instance
 */
export function useDatabaseTransaction(): Promise<Transaction>

/**
 * Creates a database transaction with callback.
 *
 * @param callback Callback function that receives the transaction instance.
 * @returns result of the callback function.
 */
export function useDatabaseTransaction<T>(callback: (t: Transaction) => PromiseLike<T>): Promise<T>
export function useDatabaseTransaction<T>(callback?: (t: Transaction) => PromiseLike<T>): Promise<T | Transaction> {
  const db = useDatabase()

  if (callback) {
    return db.sequelize.transaction(callback)
  }

  return db.sequelize.transaction()
}
