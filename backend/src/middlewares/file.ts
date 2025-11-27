import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { join, extname, basename } from 'path'
import { randomUUID } from 'crypto'
import fs from 'fs'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        const uploadDir = process.env.UPLOAD_PATH_TEMP
            ? join(__dirname, `../public/${process.env.UPLOAD_PATH_TEMP}`)
            : join(__dirname, '../public')

        // Создать папку, если директория не существует
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        cb(null, uploadDir)
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        const extension = extname(basename(file.originalname)) || '.dat'
        const uniqueName = `${randomUUID()}${extension}`
        cb(null, uniqueName)
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }

    return cb(null, true)
}

// Ограничение максимального размера файла - 10 KB
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export default multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } })

