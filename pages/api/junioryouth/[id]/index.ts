import prisma from "../../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const jyId = req.query.id;

    if (req.method === "PUT") {
        const newLesson = req.body.changedJy.lessonsCompleted[0];
        const jy = await prisma.juniorYouth.update({
            where: { id: Number(jyId) },
            data: {
                lessonsCompleted: {
                    create: {
                        text: newLesson.text,
                        lesson: newLesson.lesson,
                        date: new Date(newLesson.date),
                    },
                },
            },
        });
        res.json(jy);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`
        );
    }
};

export default handle;
