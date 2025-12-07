import { Buffer } from 'node:buffer'
import { AppError } from '#classes/app-error'
import sharp from 'sharp'

class ChallengeGeneratorService {
  /**
   * The width of the generated captcha background image in pixels.
   * @throws {AppError} INTERNAL_SERVER_ERROR
   */
  async generate() {
    const maxX = this.puzzleWidth - this.puzzlePadding - this.puzzleShapeSize
    const maxY = this.puzzleHeight - this.puzzlePadding - this.puzzleShapeSize

    const x = this.getRandomInt(this.puzzlePadding, maxX)
    const y = this.getRandomInt(this.puzzlePadding, maxY)

    const image = await this.getRandomImage()

    const imageBuffer = await sharp(image)
      .modulate({
        brightness: 1 + (Math.random() * 0.2 - 0.1),
        saturation: 1 + (Math.random() * 0.4 - 0.2),
      })
      .resize(this.puzzleWidth, this.puzzleHeight, { fit: 'cover' })
      .toBuffer()

    const svg = this.getPuzzleShapeSVG(this.puzzleShapeSize, this.puzzleShapeSize)
    const svgBuffer = Buffer.from(svg)

    const pieceRaw = await sharp(imageBuffer)
      .extract({
        left: x,
        top: y,
        width: this.puzzleShapeSize,
        height: this.puzzleShapeSize,
      })
      .toBuffer()

    const piece = await sharp(pieceRaw)
      .ensureAlpha()
      .composite([{
        input: svgBuffer,
        blend: 'dest-in',
      }])
      .toBuffer()

    const holeOverlay = await sharp(pieceRaw)
      .blur(2)
      .modulate({ brightness: 0.75 })
      .composite([{
        input: svgBuffer,
        blend: 'dest-in',
      }])
      .toBuffer()

    const finalBackground = await sharp(imageBuffer)
      .composite([{
        input: holeOverlay,
        top: y,
        left: x,
      }])
      .toBuffer()

    return {
      width: this.puzzleWidth,
      height: this.puzzleHeight,
      background: `data:image/jpeg;base64,${finalBackground.toString('base64')}`,
      piece: `data:image/png;base64,${piece.toString('base64')}`,
      pieceWidth: this.puzzleShapeSize,
      pieceHeight: this.puzzleShapeSize,
      piecePosX: x,
      piecePosY: y,
    }
  }

  /**
   * Retrieves a random image buffer from the server's asset storage.
   *
   * @returns The raw buffer of the selected image.
   * @throws Throws a 500 error if no image can be retrieved or read.
   */
  private /**
           * @throws {AppError} INTERNAL_SERVER_ERROR
           */
  async getRandomImage(): Promise<Buffer> {
    const storage = useStorage('assets:server')
    const keys = await storage.keys()
    const randomIndex = this.getRandomInt(0, keys.length - 1)
    const randomKey = keys[randomIndex]

    const image = await storage.getItemRaw(randomKey)

    if (!image) {
      throw new AppError('INTERNAL_SERVER_ERROR')
    }

    return image
  }

  /**
   * Generates a pseudo-random integer between min and max (inclusive).
   *
   * @param min - The minimum value.
   * @param max - The maximum value.
   * @returns A random integer.
   */
  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Returns the SVG string defining the puzzle piece shape.
   *
   * @param width - The width of the SVG canvas.
   * @param height - The height of the SVG canvas.
   * @returns The raw SVG XML string.
   */
  private getPuzzleShapeSVG(width: number, height: number) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40.8414 10.7206L33.4908 10.7205L33.4907 8.45201C33.4907 3.78403 29.8332 0.000327934 25.3218 0.000108124L23.6882 0C19.1767 0.00032961 15.5195 3.78403 15.5193 8.45201L15.5194 10.7205L8.16874 10.7206C3.6572 10.7205 0 14.5047 0 19.1724L1.01262e-07 26.0633H4.99711C9.50865 26.0634 13.1658 29.8473 13.1658 34.5151L13.166 36.2053C13.1658 40.8734 9.50886 44.6573 4.997 44.6573L0.000211537 44.6572V51.5481C0.000211537 56.2159 3.65699 59.9998 8.16864 59.9996L15.5193 59.9999L15.5193 55.1085C15.5196 50.4408 19.1768 46.6569 23.688 46.6567L25.3217 46.6564C29.8328 46.6568 33.4902 50.4407 33.4904 55.1085L33.4907 59.9997L40.8413 60C45.3525 59.9996 49.0099 56.2154 49.0099 51.5479L49.0098 44.6569L51.8312 44.6572C56.3427 44.6571 59.9999 40.8732 60 36.2053V34.515C60 29.8472 56.3428 26.0631 51.8313 26.0632L49.0099 26.0633L49.0101 19.1724C49.0103 14.5047 45.3529 10.7205 40.8414 10.7206Z" fill="white"/></svg>`
  }
}

export const challengeGeneratorService = new ChallengeGeneratorService()
