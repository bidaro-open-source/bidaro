import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { permissions, roles } from '../../constants'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    await queryInterface.createTable('roles', {
      name: {
        type: DataTypes.STRING(64),
        primaryKey: true,
      },
      displayName: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      isReserved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.createTable('permissions', {
      name: {
        type: DataTypes.STRING(64),
        primaryKey: true,
      },
      displayName: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(1024),
        allowNull: true,
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

    await queryInterface.createTable('roles_has_permissions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(64),
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
        references: {
          model: 'roles',
          key: 'name',
        },
      },
      permission: {
        type: DataTypes.STRING(64),
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'name',
        },
      },
    }, { transaction })

    await queryInterface.bulkInsert('roles', [{
      name: roles.USER,
      displayName: 'Користувач',
      description: 'Роль за замовчуванням',
      isReserved: true,
      createdAt: new Date(),
    }], { transaction })

    await queryInterface.bulkInsert('permissions', [
      { name: permissions.CLEAR_CACHE, createdAt: new Date() },
      { name: permissions.VIEW_ROLES, createdAt: new Date() },
      { name: permissions.CREATE_ROLE, createdAt: new Date() },
      { name: permissions.UPDATE_ROLE, createdAt: new Date() },
      { name: permissions.DELETE_ROLE, createdAt: new Date() },
      { name: permissions.VIEW_PERMISSIONS, createdAt: new Date() },
      { name: permissions.UPDATE_PERMISSIONS, createdAt: new Date() },
      { name: permissions.VIEW_ROLE_PERMISSIONS, createdAt: new Date() },
      { name: permissions.UPDATE_ROLE_PERMISSIONS, createdAt: new Date() },
    ], { transaction })

    // Create trigger to prevent modification of isReserved and name fields for reserved roles
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION prevent_reserved_role_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD."isReserved" = true THEN
          IF NEW."isReserved" IS DISTINCT FROM OLD."isReserved" THEN
            RAISE EXCEPTION 'Cannot modify isReserved field for reserved roles';
          END IF;
          IF NEW.name IS DISTINCT FROM OLD.name THEN
            RAISE EXCEPTION 'Cannot modify name field for reserved roles';
          END IF;
        END IF;
        IF NEW."isReserved" = true AND OLD."isReserved" = false THEN
          RAISE EXCEPTION 'Cannot set isReserved to true through update';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `, { transaction })

    await queryInterface.sequelize.query(`
      CREATE TRIGGER prevent_reserved_role_modification_trigger
      BEFORE UPDATE ON roles
      FOR EACH ROW
      EXECUTE FUNCTION prevent_reserved_role_modification();
    `, { transaction })

    await transaction.commit()
  }
  catch (error: any) {
    await transaction.rollback()
    throw new Error(error)
  }
}

export const down: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  // Drop trigger and function first
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS prevent_reserved_role_modification_trigger ON roles;
  `)

  await queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS prevent_reserved_role_modification();
  `)

  await queryInterface.dropTable('roles_has_permissions')
  await queryInterface.dropTable('permissions')
  await queryInterface.dropTable('roles')
}
