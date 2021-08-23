import prisma from "../../../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const notebookId = req.query.id;

    if (req.method === "PUT") {
        const notebook = await prisma.notebook.update({
            where: { id: Number(notebookId) },
            data: {
                sections: {
                    create: {
                        name: req.body.section.name,
                        notes: {
                            createMany: {
                                data: req.body.section.notes,
                            },
                        },
                    },
                },
            },
        });
        res.json(notebook);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`
        );
    }
};

export default handle;
