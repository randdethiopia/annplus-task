import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envConfig } from "../config";
import { NotFoundError, UnauthorizedError } from "../errors/api.error";
import bot from "../bot/telegram.bot";


export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundError("User not found");

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) throw new UnauthorizedError("Invalid password");

  const token = jwt.sign({ id: user.id, role: user.role }, envConfig.jwtSecret, {
    expiresIn: "1d",
  });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
};


export const loginDataCollector = async (phone: string, password: string) => {
  const collector = await prisma.dataCollector.findUnique({ where: { phone } });
  if (!collector) throw new NotFoundError("Data collector not found");

  const isValid = await bcrypt.compare(password, collector.password);
  if (!isValid) throw new UnauthorizedError("Invalid password");

  const token = jwt.sign({ id: collector.id, role: "DATA_COLLECTOR" }, envConfig.jwtSecret, {
    expiresIn: "1d"
  });

  const { password: _, ...safeCollector } = collector;

  return { collector: safeCollector, token };
};



export const resetDataCollectorPassword = async (id: string) => {

  const collector = await prisma.dataCollector.findUnique({ where: { id } });
  if (!collector) throw new NotFoundError("Data collector not found");

  const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await prisma.dataCollector.update({
    where: { id },
    data: { password: hashedPassword },
  });


  if (collector.telegramChatId) {
    try {
      await bot.sendMessage(
        collector.telegramChatId,
        `Your password has been reset. Your new temporary password is: ${tempPassword}`
      );
    } catch (err) {
      throw new Error('Failed to send Telegram notification');
    }
  } else {
    throw new NotFoundError("Telegram Chat ID not found for this data collector");
  }
}