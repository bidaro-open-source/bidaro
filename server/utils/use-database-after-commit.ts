import type { Transaction } from 'sequelize'

type TransactionCallback = (transaction: Transaction) => Promise<void> | void

/**
 * Register a callback to run after the given transaction successfully commits.
 *
 * If passed callback throws an error, it will be caught and logged to the console.
 *
 * @param transaction - The Sequelize transaction to attach the afterCommit handler to.
 * @param callback - A function that will be called after the transaction commits. Receives the transaction.
 */
export function useDatabaseAfterCommit(transaction: Transaction, callback: TransactionCallback): void

/**
 * Register a named callback to run after the given transaction successfully commits.
 *
 * If passed callback throws an error, it will be caught and logged to the console.
 *
 * The provided name is used for contextual logging if the callback throws.
 *
 * @param transaction - The Sequelize transaction to attach the afterCommit handler to.
 * @param transactionName - A descriptive name used in error logs for this callback.
 * @param callback - A function that will be called after the transaction commits. Receives the transaction.
 */
export function useDatabaseAfterCommit(transaction: Transaction, transactionName: string, callback: TransactionCallback): void
export function useDatabaseAfterCommit(transaction: Transaction, nameOrCallback: string | TransactionCallback, callback?: TransactionCallback) {
  const resolvedCallback: TransactionCallback | undefined
    = typeof nameOrCallback === 'function' ? nameOrCallback : callback

  if (!resolvedCallback)
    throw new Error('Callback function is required for useDatabaseAfterCommit')

  transaction.afterCommit(async () => {
    try {
      await resolvedCallback(transaction)
    }
    catch (error) {
      const name = typeof nameOrCallback === 'string' ? nameOrCallback : undefined

      if (name) {
        console.error(`Error in afterCommit callback "${name}":`, error)
      }
      else {
        console.error('Error in afterCommit callback:', error)
      }
    }
  })
}
