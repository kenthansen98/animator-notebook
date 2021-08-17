import { GetServerSideProps } from "next";
import { Notebook, JuniorYouth, Note, Lesson, Section } from "@prisma/client";
import Layout from "../../components/Layout";
import prisma from "../../lib/prisma";
import styles from "../../styles/SingleNotebook.module.css";
import React, { useState } from "react";
import { getSession } from "next-auth/client";
import BasicInfoForm from "../../components/BasicInfoForm";
import Router from "next/router";

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
    const [viewNotes, setViewNotes] = useState(-1);
    const [addBasicInfo, setAddBasicInfo] = useState(false);
    const [addSection, setAddSection] = useState(false);
    const [section, setSection] = useState<{ name: string, notes: { name: string, content: string }[] }>({
        name: "",
        notes: []
    });

    if (!notebook) {
        return (
            <Layout>
                <div>Unauthorized</div>
            </Layout>
        )
    }

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        try {
            const body = { section };
            await fetch(`http://localhost:3000/api/notebook/${notebook.id}/section`, {
                method: "PUT", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            setSection({ name: "", notes: [] });
            setAddSection(false);
            Router.replace(Router.asPath);
        } catch (e) {
            console.error(e);
        }
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
                            <BasicInfoForm toggleAdd={() => setAddBasicInfo(false)} notebookId={notebook.id} />
                        )}
                    </div>
                )}
                {notebook.juniorYouth.map((jy, i) => (
                    <div key={i}>
                        <div onClick={() => setViewNotes(viewNotes === -1 ? jy.id : -1)} className={styles.toggle}>
                            {jy.name}, {jy.age}
                        </div>
                        {viewNotes === jy.id &&
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
                {!addSection && <div className={styles.button} onClick={() => setAddSection(true)}>+ Add Section</div>}
                {addSection && (
                    <form onSubmit={onSubmit}>
                        <input type="text" placeholder="Section Name" value={section.name} onChange={(e) => setSection({ ...section, name: e.target.value })} />
                        {section.notes.map((note, i) => (
                            <div key={i}>
                                <div>
                                    <input type="text" placeholder="Note Name" value={note.name} onChange={(e) => setSection(
                                        { ...section, notes: section.notes.map((n, idx) => idx !== i ? n : { ...n, name: e.target.value }) }
                                    )} />
                                </div>
                                <textarea placeholder="" value={note.content} onChange={(e) => setSection(
                                    { ...section, notes: section.notes.map((n, idx) => idx !== i ? n : { ...n, content: e.target.value }) }
                                )} />
                            </div>
                        ))}
                        <button type="button" onClick={() => { setSection({ ...section, notes: section.notes.concat({ name: "", content: "" }) }); console.log(section) }}>Add Note</button>
                        <input disabled={section.name.length === 0 || section.notes.length === 0} type="submit" value="Confirm" />
                    </form>
                )}
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
