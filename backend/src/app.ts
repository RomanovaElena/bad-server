import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import rateLimit from 'express-rate-limit'
import fs from 'fs'

const { PORT = 3000, ORIGIN_ALLOW = 'http://localhost:5173' } = process.env
const app = express()

app.use(cookieParser())

app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}))
// app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

// Создание каталога для временных загрузок
const createTempUploadDir = (): void => {
    const srcUploadDir = path.join(__dirname, '../src/public/temp')
    
    if (!fs.existsSync(srcUploadDir)) {
        fs.mkdirSync(srcUploadDir, { recursive: true })
    }
}
createTempUploadDir()

app.use(serveStatic(path.join(__dirname, 'public')))

// Ограничение размера тела запроса 20 MB
app.use(urlencoded({ extended: true, limit: '20mb' }))
app.use(json({ limit: '20mb' }))

// Рейт-лимит - 50 запросов в минуту
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 50,                
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Слишком много запросов с одного IP адреса, повторите попытку позже',
})
app.use(limiter)

app.options('*', cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}))
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
