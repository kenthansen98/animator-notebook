import { GetServerSideProps } from "next";
import { Notebook, JuniorYouth, Note, Lesson, Section } from "@prisma/client";
import Layout from "../../components/Layout";
import prisma from "../../lib/prisma";
import styles from "../../styles/SingleNotebook.module.css";
import React, { useState } from "react";
import { getSession } from "next-auth/client";
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

interface NewNote {
    name: string, 
    helperText: string, 
    content: string,
    userCreated: boolean,
}

const initialNotes: NewNote[] = [
    {
        name: "Family Information",
        helperText: "Information about parents, siblings",
        content: "",
        userCreated: false
    },
    {
        name: "School Information",
        helperText: "School name, grade level, etc.",
        content: "",
        userCreated: false
    },
    {
        name: "Language Proficiency",
        helperText: "Reading level, fluency, home languages, etc.",
        content: "",
        userCreated: false
    },
]

const SingleNotebook: React.FC<Props> = ({ notebook }) => {
    const [viewNotes, setViewNotes] = useState(-1);
    const [addBasicInfo, setAddBasicInfo] = useState(false);
    const [jyName, setJyName] = useState("");
    const [jyAge, setJyAge] = useState("");
    const [jyNotes, setJyNotes] = useState<NewNote[]>(initialNotes);
    const [jyList, setJyList] = useState<{ name: string, age: string, notes: NewNote[] }[]>([]);

    if (!notebook) {
        return (
            <Layout>
                <div>Unauthorized</div>
            </Layout>
        )
    }

    const onAddJy = () => {
        setJyList([...jyList, { name: jyName, age: jyAge, notes: jyNotes }]);
        setJyName("");
        setJyAge("");
        setJyNotes(initialNotes);
    };

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        try {
            const body = { jyList };
            await fetch(`http://localhost:3000/api/notebook/${notebook.id}`, {
                method: "PUT", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            // await Router.push(`my-notebooks/${notebook.id}`);
            setAddBasicInfo(false);
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
                            <form onSubmit={onSubmit}>
                                <h3>Basic Info</h3>
                                {jyList.map((jy, i) => (
                                    <div key={i}>
                                        {jy.name}, {jy.age}
                                        <button onClick={() => setJyList(jyList.filter((_jy, idx) => idx !== i))}>x</button>
                                    </div>
                                ))}
                                <div>
                                    <h4>Junior Youth Names and Ages</h4>
                                    <input type="text" placeholder="Name" value={jyName} onChange={(e) => setJyName(e.target.value)} />
                                    <input type="number" min="10" max="17" placeholder="Age" value={jyAge} onChange={(e) => setJyAge(e.target.value)} />
                                </div>
                                {jyNotes.map((note, i) => (
                                    <div key={i}>
                                        <div>
                                            {!note.userCreated 
                                                ? <h4>{note.name}</h4> 
                                                : <div>
                                                    <label>Note Name</label>
                                                    <input type="text" value={note.name} onChange={(e) => setJyNotes(
                                                        jyNotes.map((note, idx) => idx !== i ? note : { ...note, name: e.target.value })
                                                    )} />
                                                </div>
                                            }
                                            <i>{note.helperText}</i>
                                        </div>
                                        <textarea
                                            value={note.content}
                                            onChange={(e) => setJyNotes(
                                                jyNotes.map((note, idx) => idx !== i ? note : { ...note, content: e.target.value })
                                            )}
                                        />
                                    </div>
                                ))}
                                <button onClick={() => setJyNotes(jyNotes.concat({ name: "", helperText: "", content: "", userCreated: true }))}>Add Note</button>
                                <input disabled={!jyName || !jyAge} type="button" value="Add" onClick={onAddJy} />
                                <input disabled={jyList.length === 0} type="submit" value="Confirm" />
                            </form>
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
