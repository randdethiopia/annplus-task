import dotenv from 'dotenv';
import z, { jwt } from 'zod';  

dotenv.config();


const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  WEBHOOK_URL: z.string().min(1, 'WEBHOOK_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  BOT_USERNAME: z.string().min(1, 'BOT_USERNAME is required'),

});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.message);
  process.exit(1);
}

export const envConfig = {
  telegramBotToken: parsedEnv.data.TELEGRAM_BOT_TOKEN,
  port: parsedEnv.data.PORT || '5000',
  databaseUrl: parsedEnv.data.DATABASE_URL,
  webhookUrl: parsedEnv.data.WEBHOOK_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  botUsername: parsedEnv.data.BOT_USERNAME,

};