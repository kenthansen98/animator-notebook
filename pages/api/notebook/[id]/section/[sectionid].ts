import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const sectionId = req.query.sectionid;
    if (req.method === 'DELETE') {
        const section = await prisma.section.delete({
            where: { id: Number(sectionId) }
        });
        res.json(section);
    } else {
        throw new Error(
            `The HTTP ${req.method} method is not supported at this route.`,
        );
    }
};

export default handle;