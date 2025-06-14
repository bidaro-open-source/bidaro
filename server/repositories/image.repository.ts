import type { Transaction } from 'sequelize'
import type { Image, ImageAttributesOptional } from '../database/models/Image'

interface Options {
  transaction?: Transaction
}

export const imageRepository = {
  /**
   * Finds a image by their primary key.
   *
   * @param id - image primary key
   * @param options - sequelize options
   * @returns Image instance or null if not found
   */
  findById: (id: number, options: Options = {}): Promise<Image | null> => {
    const db = useDatabase()

    return db.Image.findByPk(id, { transaction: options.transaction })
  },

  /**
   * Creates a new image record in the database.
   *
   * @param fields - image attributes
   * @param options - sequelize options
   * @returns Image instance
   */
  create(fields: ImageAttributesOptional, options: Options = {}): Promise<Image> {
    const db = useDatabase()

    return db.Image.create(
      fields,
      {
        transaction: options.transaction,
      },
    )
  },

  /**
   * Destorys a image record in the database.
   *
   * @param image - image instance
   * @param options - sequelize options
   */
  destroy(image: Image, options: Options = {}): Promise<void> {
    return image.destroy({ transaction: options.transaction })
  },
}
