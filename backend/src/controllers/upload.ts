import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'

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
