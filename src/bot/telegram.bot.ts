import TelegramBot from 'node-telegram-bot-api';
import { envConfig } from '../config';
import { dataCollectorService } from '../services';

const token = envConfig.telegramBotToken;
const bot = new TelegramBot(token);

export const sendMessage = async (
  chatId: number,
  text: string,
) => {
  try {
    await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error sending message:", error)
  }
}



export const handleTaskAssignment = async (payload: {
  chatId: string,
  taskId: string,
  taskTitle: string,
  taskDescription: string
}) => {
  const { chatId, taskId, taskTitle, taskDescription } = payload;

  const taskDetails = [
    `You have been assigned a new task: ${taskTitle}`,
    `Task ID: ${taskId}`,
    taskDescription ? `Description: ${taskDescription}` : null,
  ].filter(Boolean).join("\n");

  await bot.sendMessage(chatId, taskDetails);
};


bot.onText(/\/start/, async (msg) => {
  const chatId = msg.from?.id;
  const telegramUsername = msg.from?.username;

  const user = await dataCollectorService.getDataCollectorByTelegramUsername(telegramUsername!);

  if (!chatId) return bot.sendMessage(msg.chat.id, `Unable to retrieve your Telegram chat ID. please contact to ${process.env.ADMIN_CONTACT || "the administrator"}`);
  if (!user) return bot.sendMessage(msg.chat.id, `You are not registered. Please register first.\n contact ${process.env.ADMIN_CONTACT || "the administrator"}`);

  if (user?.telegramChatId) {
    return bot.sendMessage(msg.chat.id, 'You are already registered. This bot sends task notifications only.');
  }


  if (!user.telegramChatId && chatId) {
    await dataCollectorService.updateDataCollector(user?.id, { telegramChatId: String(chatId) });
    return bot.sendMessage(msg.chat.id, 'You have been registered successfully. This bot sends task notifications only.');
  }
});


export default bot;
