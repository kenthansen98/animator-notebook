import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const notebookId = req.query.id;
    if (req.method === 'DELETE') {
        const notebook = await prisma.notebook.delete({
            where: { id: Number(notebookId) }
        });
        res.json(notebook);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`,
        );
    }
};

export default handle;