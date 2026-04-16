import { SubmissionStatus, TaskMediaType } from "../generated/prisma/enums";
import { Prisma } from "../generated/prisma/client";
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


const buildSubmissionScope = (userRole?: string, userId?: string): Prisma.SubmissionWhereInput => {
    if (userRole === "SUPERVISOR" && userId) {
        return {
            task: {
                createdById: userId,
            },
        };
    }

    return {};
};

export const updateSubmission = async (
    id: string,
    data: Partial<UpdateSubmissionInput>,
    userRole?: string,
    userId?: string
) => {
    const scope = buildSubmissionScope(userRole, userId);

    if (userRole === "SUPERVISOR" && userId) {
        const allowed = await prisma.submission.findFirst({
            where: {
                id,
                ...scope,
            },
            select: { id: true },
        });

        if (!allowed) return null;
    }

    return await prisma.submission.update({
        where: { id },
        data
    });
};

export const getAllSubmissions = async (userRole?: string, userId?: string) => {
    const where = buildSubmissionScope(userRole, userId);

    return prisma.submission.findMany({
        where,
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

export const getSubmissionById = async (
    submissionId: string,
    userRole?: string,
    userId?: string
) => {
    const where = buildSubmissionScope(userRole, userId);

    return prisma.submission.findFirst({
        where: {
            id: submissionId,
            ...where,
        },
        include: {
            task: true,
            collector: true
        }
    });
}