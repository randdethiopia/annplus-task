import express from 'express';
import { envConfig } from './config';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "../swagger.config"
import api from './api';
import { errorHandlerMiddleware } from './middlewares/error.middleware';
import bot from './bot/telegram.bot';

const PORT = envConfig.port;

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically at /uploads
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(UPLOADS_DIR))


app.get('/', (req, res) => {
  res.send('Hello from Annotate plus task API!');
});


app.use('/api', api);
app.post('/bot/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


app.use(errorHandlerMiddleware);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
