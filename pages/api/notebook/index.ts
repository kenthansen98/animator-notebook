import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";
import prisma from "../../../lib/prisma";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    const { name } = req.body;

    const session = await getSession({ req });
    const result = await prisma.notebook.create({
        data: {
            name: name,
            author: { connect: { email: session?.user?.email! } },
        },
    });
    res.json(result);
};

export default handle;