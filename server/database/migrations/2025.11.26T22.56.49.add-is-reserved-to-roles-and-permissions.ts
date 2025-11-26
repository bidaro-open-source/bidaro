import type { Migration } from '../console/migrator-cli'
import { DataTypes } from 'sequelize'
import { permissions, roles } from '../../constants'

export const up: Migration = async ({ context }) => {
  const queryInterface = context.sequelize.getQueryInterface()

  const transaction = await queryInterface.sequelize.transaction()

  try {
    // Add isReserved column to roles table
    await queryInterface.addColumn('roles', 'isReserved', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }, { transaction })

    // Add isReserved column to permissions table
    await queryInterface.addColumn('permissions', 'isReserved', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }, { transaction })

    // Update the reserved role (user) to have isReserved = true
    await queryInterface.bulkUpdate('roles', {
      isReserved: true,
    }, {
      name: roles.USER,
    }, { transaction })

    // Update the reserved permissions to have isReserved = true
    await queryInterface.bulkUpdate('permissions', {
      isReserved: true,
    }, {
      name: [
        permissions.CLEAR_CACHE,
        permissions.VIEW_PERMISSIONS,
        permissions.UPDATE_PERMISSIONS,
        permissions.VIEW_ROLES,
        permissions.CREATE_ROLE,
        permissions.UPDATE_ROLE,
        permissions.DELETE_ROLE,
        permissions.VIEW_ROLE_PERMISSIONS,
        permissions.UPDATE_ROLE_PERMISSIONS,
      ],
    }, { transaction })

    // Create trigger to prevent modification of isReserved and name fields for roles
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

    // Create trigger to prevent modification of isReserved and name fields for permissions
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION prevent_reserved_permission_modification()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD."isReserved" = true THEN
          IF NEW."isReserved" IS DISTINCT FROM OLD."isReserved" THEN
            RAISE EXCEPTION 'Cannot modify isReserved field for reserved permissions';
          END IF;
          IF NEW.name IS DISTINCT FROM OLD.name THEN
            RAISE EXCEPTION 'Cannot modify name field for reserved permissions';
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
      CREATE TRIGGER prevent_reserved_permission_modification_trigger
      BEFORE UPDATE ON permissions
      FOR EACH ROW
      EXECUTE FUNCTION prevent_reserved_permission_modification();
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

  const transaction = await queryInterface.sequelize.transaction()

  try {
    // Drop triggers first
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS prevent_reserved_role_modification_trigger ON roles;
    `, { transaction })

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS prevent_reserved_role_modification();
    `, { transaction })

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS prevent_reserved_permission_modification_trigger ON permissions;
    `, { transaction })

    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS prevent_reserved_permission_modification();
    `, { transaction })

    // Remove columns
    await queryInterface.removeColumn('roles', 'isReserved', { transaction })
    await queryInterface.removeColumn('permissions', 'isReserved', { transaction })

    await transaction.commit()
  }
  catch (error: any) {
    await transaction.rollback()
    throw new Error(error)
  }
}
