import { SubmissionStatus, TaskMediaType } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";


interface SubmissionInput {
    taskId: string;
    collectorId: string;
    uploadUrl: string;
    mediaType: TaskMediaType;
}

interface Submission extends SubmissionInput {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

interface UpdateSubmissionInput extends SubmissionInput{
    reviewedById?: string;
    status?: SubmissionStatus;
    reviewerNote?: string;
}

export const createSubmission = async (data: SubmissionInput)=> {
    const { taskId, collectorId, uploadUrl, mediaType } = data;

    return await prisma.submission.create({
        data: {
            taskId,
            collectorId,
            mediaType,
            uploadUrl,
        }
    });
};

export const submitTaskIfRequirementSatisfied = async (
    taskId: string,
    collectorId: string
) => {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
            id: true,
            status: true,
            imageCount: true,
            videoCount: true,
        },
    });

    if (!task) return null;

    const [submittedImages, submittedVideos] = await Promise.all([
        prisma.submission.count({
            where: {
                taskId,
                collectorId,
                mediaType: TaskMediaType.IMAGE,
            },
        }),
        prisma.submission.count({
            where: {
                taskId,
                collectorId,
                mediaType: TaskMediaType.VIDEO,
            },
        }),
    ]);

    const requiredImageCount = task.imageCount ?? 0;
    const requiredVideoCount = task.videoCount ?? 0;

    const isSatisfied =
        submittedImages >= requiredImageCount &&
        submittedVideos >= requiredVideoCount;

    if (!isSatisfied || task.status === SubmissionStatus.SUBMITTED) {
        return null;
    }

    return prisma.task.update({
        where: { id: taskId },
        data: { status: SubmissionStatus.SUBMITTED },
    });
};


export const updateSubmission = async (id: string, data: Partial<UpdateSubmissionInput>) => {
    return await prisma.submission.update({
        where: { id },
        data
    });
};


export const getAllSubmissions = async () => {
    return prisma.submission.findMany({
        include: {
            task: true,
            collector: true
        }
    });
};

export const getSubmissionsByTaskId = async (taskId: string) => {
    return prisma.submission.findMany({
        where: { taskId },
        include: {
            task: true,
            collector: true
        }
    });
};

export const getSubmissionByCollectorId = async (collectorId: string) => {
    return prisma.submission.findMany({
        where: { collectorId },
        include: {
            task: true,
            collector: true
        }
    });
};

export const getSubmissionById = async (submissionId: string) => {
    return prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
            task: true,
            collector: true
        }
    });
}