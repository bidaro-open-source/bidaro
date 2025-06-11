/**
 * Returns a Sequelize transaction instance.
 *
 * @param event H3Event
 * @returns A Sequelize transaction instance
 */
export function useDatabaseTransaction(event?: H3Event) {
  return useDatabase(event).sequelize.transaction()
}
