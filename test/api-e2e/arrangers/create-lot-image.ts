/**
 * Attach exists image to the lot by ids.
 *
 * The clear function deletes only this attaching.
 *
 * @param lotId lot primary key
 * @param imageId image primary key
 * @returns lot image with clear function
 */
export async function createLotImage(lotId: number, imageId: number) {
  const result = await db.LotImage.findOne({
    raw: true,
    where: { lotId },
    attributes: [
      [db.sequelize.fn('max', db.sequelize.col('order')), 'max_order'],
    ],
  })

  // @ts-expect-error used raw reqeust
  const maxOrder = result.max_order ?? 1

  const lotImage = await db.LotImage.create({
    order: maxOrder + 1,
    imageId,
    lotId,
  })

  const clear = async () => {
    await lotImage.destroy()
  }

  return { lotImage, clear }
}
