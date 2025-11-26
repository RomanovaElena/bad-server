import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import sharp from 'sharp'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        // Ограничение минимального размера файла - 2 KB
        const MIN_SIZE = 2 * 1024
        const fileSize = req.file.size ?? req.file.buffer?.length ?? 0;
        if (fileSize < MIN_SIZE) {
            return next(new BadRequestError('Файл меньше минимального допустимого размера - 2KB'))
        }

        // Проверка, что файл является изображением
        try {
            if (req.file.path) {
                await sharp(req.file.path).metadata()
            } else if (req.file.buffer) {
                await sharp(req.file.buffer).metadata()
            } else {
                throw new Error('Нет данных для проверки изображения')
            }
        } catch {
            return next(new BadRequestError('Файл не является изображением'))
        }

        const fullPath = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).json({
            fileName: fullPath,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
