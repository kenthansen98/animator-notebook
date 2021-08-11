import prisma from "../../lib/prisma";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "../../components/Layout";
import { getSession } from "next-auth/client";
import { Notebook } from "@prisma/client";
import styles from "../../styles/NotebookList.module.css";

interface Props {
    notebooks: (Notebook & {
        author: {
            name: string | null;
        } | null;
    })[];
}

const NotebookList: React.FC<Props> = ({ notebooks }) => {
    return (
        <Layout>
            <div className={styles.notebooks}>
                {notebooks.map((nb, i) => (
                    <Link href={`/my-notebooks/${nb.id}`} key={i}>
                        <a>
                            <div className={styles.notebook}>
                                <h4>{nb.name}</h4>
                                <i>{nb.author?.name}</i>
                            </div>
                        </a>
                    </Link>
                ))}
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getSession({ req });
    if (!session) {
        res.statusCode = 403;
        return { props: { notebooks: [] } };
    }
    const notebooks = await prisma.notebook.findMany({
        where: {
            author: { email: session.user?.email },
        },
        include: {
            author: {
                select: { name: true },
            },
        },
    });
    return {
        props: { notebooks },
    };
};

export default NotebookList;
