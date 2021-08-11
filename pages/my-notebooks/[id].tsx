import { GetServerSideProps } from "next";
import { Notebook, JuniorYouth, Note, Lesson, Section } from "@prisma/client";
import Layout from "../../components/Layout";
import prisma from "../../lib/prisma";
import styles from "../../styles/SingleNotebook.module.css";
import { useState } from "react";
import { getSession } from "next-auth/client";

interface Props {
    notebook:
    | (Notebook & {
        author: {
            name: string | null;
            email: string | null;
        } | null;
        juniorYouth: (JuniorYouth & {
            notes: Note[];
            lessonsCompleted: Lesson[];
        })[];
        sections: (Section & {
            notes: Note[];
        })[];
    })
    | null;
}

const SingleNotebook: React.FC<Props> = ({ notebook }) => {
    const [viewNotes, setViewNotes] = useState(false);
    const [addBasicInfo, setAddBasicInfo] = useState(false);
    const [jyName, setJyName] = useState("");
    const [jyAge, setJyAge] = useState("");

    if (!notebook) {
        return (
            <Layout>
                <div>Unauthorized</div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className={styles.content}>
                <h1>{notebook?.name}</h1>
                {notebook.juniorYouth.length > 0 && <h2>Basic Info</h2>}
                {notebook.juniorYouth.length === 0 && (
                    <div>
                        {!addBasicInfo && <div className={styles.button} onClick={() => setAddBasicInfo(true)}>+ Add Basic Info</div>}
                        {addBasicInfo && (
                            <form>
                                <h4>Junior Youth</h4>
                                <input type="text" placeholder="Name" value={jyName} onChange={(e) => setJyName(e.target.value)} />
                                <input type="number" min="10" max="17" placeholder="Age" value={jyAge} onChange={(e) => setJyAge(e.target.value)} />
                                <input disabled={!jyName || !jyAge} type="submit" value="Add" />
                            </form>
                        )}
                    </div>
                )}
                {notebook.juniorYouth.map((jy, i) => (
                    <div key={i}>
                        <div onClick={() => setViewNotes(!viewNotes)} className={styles.toggle}>
                            {jy.name}, {jy.age}
                        </div>
                        {viewNotes &&
                            jy.notes.map((note, i) => (
                                <div key={i}>
                                    <h4>- {note.name}</h4>
                                    <p>{note.content}</p>
                                </div>
                            ))
                        }
                    </div>
                ))}
                {notebook.sections.map((section, i) => (
                    <div key={i}>
                        <h2>{section.name}</h2>
                        {section.notes.map((note, i) => (
                            <div key={i}>
                                <h4>- {note.name}</h4>
                                <p>{note.content}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
    const session = await getSession({ req });
    if (!session) {
        res.statusCode = 403;
        return {
            props: { notebook: undefined }
        }
    }
    const notebook = await prisma.notebook.findUnique({
        where: { id: Number(params?.id) || -1 },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                },
            },
            juniorYouth: {
                include: {
                    notes: true,
                    lessonsCompleted: true,
                },
            },
            sections: {
                include: {
                    notes: true,
                },
            },
        },
    });
    return {
        props: { notebook },
    };
};

export default SingleNotebook;
