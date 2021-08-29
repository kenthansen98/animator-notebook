import prisma from "../../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const jyId = req.query.id;

    if (req.method === "PUT") {
        const lessons = req.body.jy.lessonsCompleted;
        const jy = await prisma.juniorYouth.update({
            where: { id: Number(jyId) },
            data: {
                lessonsCompleted: {
                    deleteMany: {},
                    createMany: {
                        data: lessons.length > 0 ? (lessons as any[]).map((lesson) => ({
                            text: lesson.text,
                            lesson: lesson.lesson,
                            date: new Date(lesson.date)
                        })) : []
                    }
                }
            }
        });
        res.json(jy);
    } else if (req.method === "DELETE") {
        const jy = await prisma.juniorYouth.delete({
            where: { id: Number(jyId) }
        });
        res.json(jy);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`
        );
    }
};

export default handle;
