import { ConflictError, NotFoundError } from "../errors/api.error";
import { SubmissionStatus, TaskMediaType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

type CreateTaskInput = {
    title: string;
    description: string;
    createdById: string;
    videoCount: number;
    imageCount: number;
};

interface UpdateTaskInput extends CreateTaskInput {
    status?: SubmissionStatus;
    reviewerNote?: string;
    reviewedById?: string;
}


export async function createTask(input: CreateTaskInput) {
  const { title, description, videoCount, imageCount, createdById } = input;

  return prisma.task.create({
    data: {
      title,
      description,
      videoCount,
      imageCount,
      createdById,
    },
  });
}


export const updateTask = async (id: string, data: Partial<UpdateTaskInput>) => {
    return prisma.task.update({
        where: { id },
        data,
    });
};

export const getTasks = async (query: {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  sortOrder?: "asc" | "desc";
}) => {
  
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);

  const where = query.status ? { status: query.status } : {};
  const sort = query.sortOrder === "asc" ? "asc" : "desc";

  const totalCount = await prisma.task.count({ where });

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: sort },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      _count: {
        select: { submissions: true },
      },
    },
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    tasks,
    totalCount,
    totalPages,
    page,
    limit,
  };
};


export const getTasksByCollector = async (query: {
  collectorId: string;
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
}) => {
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);

  const where = {
    ...(query.status ? { status: query.status } : {}),
    collectorTask: {
      some: {
        collectorId: query.collectorId,
      },
    },
  };

  const [totalCount, tasks] = await prisma.$transaction([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        submissions: {
          where: {
            collectorId: query.collectorId,
          },
          select: {
            mediaType: true,
          },
        },
        _count: {
          select: {
            submissions: {
              where: {
                collectorId: query.collectorId,
              },
            },
          },
        },
      },
    }),
  ]);

  const tasksWithUploadedCount = tasks.map((task) => {
    const uploadedImages = task.submissions.filter(
      (submission) => submission.mediaType === TaskMediaType.IMAGE
    ).length;

    const uploadedVideos = task.submissions.filter(
      (submission) => submission.mediaType === TaskMediaType.VIDEO
    ).length;

    const { submissions, ...taskData } = task;

    return {
      ...taskData,
      uploaded: {
        images: uploadedImages,
        videos: uploadedVideos,
        total: task._count.submissions,
      },
    };
  });

  const totalPages = Math.ceil(totalCount / limit);

  return {
    tasks: tasksWithUploadedCount,
    totalCount,
    totalPages,
    page,
    limit,
  };
};

export const getTaskById = async (id: string) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
          submissions: true
        }
    });

    const remainingImages = task?.submissions.filter(
      (submission) => submission.mediaType === TaskMediaType.IMAGE
    ) || [];

    const remainingVideos = task?.submissions.filter(
      (submission) => submission.mediaType === TaskMediaType.VIDEO
    ) || [];

    const uploaded = {
      images: remainingImages.length,
      videos: remainingVideos.length,
      total: task?.submissions.length || 0,
    };

    return {
      task: {
        ...task,
        uploaded,
      },
      images: {
        total: task?.imageCount || 0,
        remaining: remainingImages
      },
      videos: {
        total: task?.videoCount || 0,
        remaining: remainingVideos
      }
    };
};

export const getCollectorTaskByChatId = async (chatId: string) => {

  const collector = await prisma.dataCollector.findUnique({
    where: { telegramChatId: chatId },
    include: {
      collectorTasks: {
        where: {
          task: {
            status: SubmissionStatus.PENDING,
          },
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
            },
          },
        },
      },
    },
  });

  const tasks = collector?.collectorTasks.map(ct => ct.task) || [];

  return tasks;

};


export const reviewTask = async (
  id: string,
  payload: {
    status: SubmissionStatus;
    reviewerNote?: string;
    reviewedById?: string;
  }
) => {
  let data: any = { ...payload };

  if (payload.status === SubmissionStatus.REJECTED) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { title: true },
    });

    if (task && !task.title.endsWith("-rejected")) {
      data.title = `${task.title}-rejected`;
    }
  }

  return prisma.task.update({
    where: { id },
    data,
    include: {
      collectorTask: {
        include: {
          collector: {
            select: {
              id: true,
              name: true,
              telegramChatId: true,
            },
          },
        },
      },
    },
  });
};

export const assignTaskToCollector = async ( collectorId: string, taskId: string ) => {
  const [task, collectorTask] = await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { isAssigned: true },
    }),
    prisma.collectorTask.create({
      data: {
        collectorId,
        taskId,
      },
      select: {
        id: true,
        collector: {
          select: {
            id: true,
            name: true,
            telegramChatId: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    }),
  ]);

  return collectorTask;
 }

export const recreateRejectedTask = async (taskId: string, createdById: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { status: true, title: true, videoCount: true, imageCount: true, description: true }
  });

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  if (task.status !== SubmissionStatus.REJECTED) {
    throw new ConflictError("Only rejected tasks can be reassigned");
  }

  let newTitle = task.title;
  if (newTitle.trim().toLowerCase().endsWith('-rejected')) {
    newTitle = newTitle.trim().replace(/-rejected$/i, '');
  }

  return prisma.task.create({
    data: {
      title: newTitle,
      description: task.description,
      videoCount: task.videoCount,
      imageCount: task.imageCount,
      createdById
    },
  });
};

export const archiveTask = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { status: true }
  });

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  if (task.status !== SubmissionStatus.APPROVED) {
    throw new ConflictError("Only approved tasks can be archived");
  }

  return prisma.task.update({
    where: { id },
    data: { isActive: false },
  });
};