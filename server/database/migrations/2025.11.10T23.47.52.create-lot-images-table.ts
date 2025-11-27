import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { permissions } from '../../constants'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('lot_images', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'lots',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      imageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'images',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    }, { transaction })

    await queryInterface.addConstraint('lot_images', {
      fields: ['lotId', 'order'],
      type: 'unique',
      name: 'lot_images_lotId_order_uk',
      transaction,
    })

    await queryInterface.addConstraint('lot_images', {
      fields: ['lotId', 'imageId'],
      type: 'unique',
      name: 'lot_images_lotId_imageId_uk',
      transaction,
    })

    await queryInterface.bulkInsert('permissions', [
      { name: permissions.VIEW_LOT_IMAGES, createdAt: new Date() },
      { name: permissions.UPLOAD_LOT_IMAGE, createdAt: new Date() },
      { name: permissions.DELETE_LOT_IMAGE, createdAt: new Date() },
      { name: permissions.UPDATE_LOT_IMAGE_ORDER, createdAt: new Date() },
    ], { transaction })

    await transaction.commit()
  }
  catch (error: any) {
    await transaction.rollback()
    throw new Error(error)
  }
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  await queryInterface.dropTable('lot_images')
}
