import type { Model } from 'sequelize'

type Instance<T extends Model<any>> = T | null | undefined

export type SourceInvalidateParams<T extends Model<any>> = Instance<T> | Instance<T>[]
