import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('images', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      bucket: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      key: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      mime_type: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      size_bytes: {
        allowNull: false,
        type: DataTypes.BIGINT,
      },
      metadata: {
        allowNull: true,
        type: DataTypes.JSONB,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, { transaction })

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
  await queryInterface.dropTable('images')
}
