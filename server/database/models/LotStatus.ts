import type { InferAttributes, InferCreationAttributes } from 'sequelize'
import type { DatabaseOptional } from '../types'
import { DataTypes, Model } from 'sequelize'

export type LotStatusModel = typeof LotStatus
export type LotStatusAttributes = InferAttributes<LotStatus>
export type LotStatusCreationAttributes = InferCreationAttributes<LotStatus>

export class LotStatus extends Model<LotStatusAttributes, LotStatusCreationAttributes> {
  declare name: string
}

export function InitializeLotStatus(database: DatabaseOptional) {
  LotStatus.init(
    {
      name: {
        type: DataTypes.STRING(32),
        unique: true,
        primaryKey: true,
        allowNull: false,
      },
    },
    {
      sequelize: database.sequelize,
      modelName: 'LotStatus',
      tableName: 'lot_statuses',
      timestamps: false,
    },
  )

  return LotStatus
}
