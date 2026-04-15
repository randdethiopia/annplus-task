import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { envConfig } from '../config'

const adapter = new PrismaPg({
  connectionString: envConfig.databaseUrl,
})

export const prisma = new PrismaClient({
  adapter,
})