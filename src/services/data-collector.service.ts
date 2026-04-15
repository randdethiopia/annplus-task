import bcrypt from "bcrypt";
import { ConflictError, InternalServerError, NotFoundError } from "../errors/api.error";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";



interface DataCollector {
    name: string;
    phone: string;
    password: string;
    telegramUsername?: string;
    telegramChatId?: string;
}



export const createDataCollector = async (collectorData: DataCollector) => {
    try {
        const { name, phone, password, telegramUsername } = collectorData;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log(hashedPassword)

        const collector = await prisma.dataCollector.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                telegramUsername,
            },
            omit: {
                password: true
            }
        });

        return collector;

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new ConflictError("Data collector already exists");
            }
        }
        throw new InternalServerError("Error creating data collector");
    }
}


export const updateDataCollector = async ( id:string, collectorData: Partial<DataCollector> ) => {
    const dataToUpdate = { ...collectorData };
    if (collectorData.password) {
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.password = await bcrypt.hash(collectorData.password, salt);
    }

    const collector = await prisma.dataCollector.update({
        where: {
            id
        },
        data: dataToUpdate,
        omit: {
            password: true
        }
    });

    return collector;
}


export const getAllDataCollectors = async () => {
    const collectors = await prisma.dataCollector.findMany({
        omit:{
            password: true
        }
    });
    return collectors.map(collector => ({
        ...collector,
        telegramChatId:
            collector.telegramChatId !== null && collector.telegramChatId !== undefined
                ? String(collector.telegramChatId)
                : null
    }));
};

export const getDataCollectorById = async(id: string) => {
    const collector = await prisma.dataCollector.findUnique({
        where: {
            id
        },
        omit:{
            password: true
        }
    });

    if (!collector) throw new NotFoundError("Data collector not found");

    return { ...collector, telegramChatId: String(collector.telegramChatId) };
}


export const getDataCollectorByTelegramUsername = async(telegramUsername: string) => {
    const collector = await prisma.dataCollector.findFirst({
        where: {
            telegramUsername
        }
    })

    return collector;
}


export const getDataCollectorByTelegramChatId = async(telegramChatId: string) => {
    const collector = await prisma.dataCollector.findFirst({
        where: {
            telegramChatId
        }
    })

    return collector;
}

export const getDataCollectorByTaskId = async(taskId: string) => {
    const collector = await prisma.dataCollector.findFirst({
        where: {
            collectorTasks: {
                some: {
                    taskId
                }
            }
        }
    })

    return collector;
}

export const updateDataCollectorState = async (data: {
  collectorChatId: string
  currentTaskId?: string | null
  state?: string
}) => {
  const { collectorChatId, currentTaskId } = data

  const collector = await prisma.dataCollector.findUnique({
    where: { telegramChatId: collectorChatId },
    select: { id: true }
  })
  if (!collector) return null

  let state = "uploading";
  let taskId = currentTaskId ?? null;
  let isDone = false;

  if (currentTaskId) {
    const task = await prisma.task.findUnique({
      where: { id: currentTaskId },
      select: {
        imageCount: true,
        videoCount: true,
        submissions: { select: { mediaType: true } }
      }
    })
    if (!task) return null

    
    const imagesSubmitted = task.submissions.filter(s => s.mediaType === "IMAGE").length;
    const videosSubmitted = task.submissions.filter(s => s.mediaType === "VIDEO").length;
    
    
    const expectedImages = task.imageCount ?? 0;
    const expectedVideos = task.videoCount ?? 0;

    if (task.submissions.length > 0 && imagesSubmitted >= expectedImages && videosSubmitted >= expectedVideos) {
      state = "idle";
      taskId = null;
      isDone = true;
    }
  }

  const upsertedState = await prisma.dataCollectorState.upsert({
    where: { collectorChatId },
    update: { currentTaskId: taskId, state },
    create: {
      collectorId: collector.id,
      collectorChatId,
      currentTaskId: taskId,
      state
    }
  })

  return {
    collectorState: upsertedState,
    isDone
  }

}



export const getDataCollectorState = async (chatId: string) => {
    const state = await prisma.dataCollectorState.findUnique({
        where: { collectorChatId: chatId }
    });

    return state;
};