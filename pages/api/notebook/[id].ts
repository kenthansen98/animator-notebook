import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { JuniorYouth, Note } from ".prisma/client";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const notebookId = req.query.id;

    if (req.method === 'PUT') {
        console.log(req.body);

        await prisma.notebook.update({
            where: { id: Number(notebookId) },
            data: {
                juniorYouth: {
                    createMany: {
                        data: (req.body.jyList as any[]).map((jy) => (
                            {
                                name: jy.name,
                                age: Number(jy.age),
                            }
                        ))
                    }
                }
            }
        });

        const jyInNotebook = await prisma.juniorYouth.findMany({
            where: { notebookId: Number(notebookId) }
        });
        jyInNotebook.forEach(async (jy) => {
            await prisma.juniorYouth.update({
                where: { id: jy.id },
                data: {
                    notes: {
                        createMany: {
                            data: ((req.body.jyList as any[]).find(
                                nestedJy => nestedJy.name === jy.name
                            ).notes as any[]).map(
                                note => (
                                    { name: note.name, content: note.content }
                                )
                            )
                        }
                    }
                }
            })
        });
        const updatedNotebook = await prisma.notebook.findUnique({
            where: { id: Number(notebookId) }
        });
        res.json(updatedNotebook);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`,
        );
    }
}

export default handle;