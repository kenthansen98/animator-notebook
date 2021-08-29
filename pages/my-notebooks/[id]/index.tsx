import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import React, { useState } from "react";

import { Notebook, JuniorYouth, Note, Lesson, Section } from "@prisma/client";
import Layout from "../../../components/Layout";
import prisma from "../../../lib/prisma";
import styles from "../../../styles/SingleNotebook.module.css";
import SectionForm from "../../../components/SectionForm";
import BasicInfoForm from "../../../components/BasicInfoForm";
import Router from "next/router";
import Link from "next/link";

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
    const [viewNotes, setViewNotes] = useState<number[]>([]);
    const [addBasicInfo, setAddBasicInfo] = useState(false);
    const [addSection, setAddSection] = useState(false);

    if (!notebook) {
        return (
            <Layout>
                <div>Unauthorized</div>
            </Layout>
        );
    }

    const deleteNotebook = async () => {
        if (window.confirm("Are you sure you want to delete this notebook?")) {
            await fetch(`http://localhost:3000/api/notebook/${notebook.id}`, {
                method: "DELETE",
            });
            Router.push("/my-notebooks");
        }
    };

    const deleteSection = async (sectionId: number) => {
        if (window.confirm("Are you sure you want to delete this section?")) {
            await fetch(
                `http://localhost:3000/api/notebook/${notebook.id}/section/${sectionId}`,
                {
                    method: "DELETE",
                }
            );
            Router.replace(Router.asPath);
        }
    };

    const deleteJy = async (jyId: number) => {
        if (window.confirm("Are you sure you want to delete this participant?")) {
            await fetch(
                `http://localhost:3000/api/junioryouth/${jyId}`,
                {
                    method: "DELETE",
                }
            );
            Router.replace(Router.asPath);
        }
    }

    return (
        <Layout>
            <div className={styles.content}>
                <h1>
                    {notebook?.name}
                    <button onClick={deleteNotebook}>x</button>
                </h1>
                {notebook.juniorYouth.length > 0 && (
                    <div>
                        <h2>
                            Basic Info
                            <button
                                onClick={() => setAddBasicInfo(!addBasicInfo)}
                            >
                                edit
                            </button>
                        </h2>
                    </div>
                )}
                {notebook.juniorYouth.length === 0 && (
                    <div>
                        {!addBasicInfo && (
                            <div
                                className={styles.button}
                                onClick={() => setAddBasicInfo(true)}
                            >
                                + Add Basic Info
                            </div>
                        )}
                    </div>
                )}
                {notebook.juniorYouth.map((jy, i) => (
                    <div key={i}>
                        <div
                            onClick={() =>
                                setViewNotes(
                                    viewNotes.includes(jy.id)
                                        ? viewNotes.filter((id) => id !== jy.id)
                                        : viewNotes.concat(jy.id)
                                )
                            }
                            className={styles.toggle}
                        >
                            {jy.name}, {jy.age} {addBasicInfo && <button onClick={() => deleteJy(jy.id)}>x</button>}
                        </div>
                        {viewNotes.includes(jy.id) &&
                            jy.notes.map(
                                (note, i) =>
                                    note.content !== "" && (
                                        <div key={i}>
                                            <h4>- {note.name}</h4>
                                            <p>{note.content}</p>
                                        </div>
                                    )
                            )}
                    </div>
                ))}
                {notebook.juniorYouth.length > 0 && (
                    <Link href={`/my-notebooks/${notebook.id}/lessons`}>
                        <a>
                            <div className={styles.button}>View Lessons</div>
                        </a>
                    </Link>
                )}

                {addBasicInfo && (
                    <BasicInfoForm
                        toggleAdd={() => setAddBasicInfo(false)}
                        notebookId={notebook.id}
                    />
                )}
                {notebook.sections.map((section, i) => (
                    <div key={i}>
                        <h2>
                            {section.name}
                            <button onClick={() => deleteSection(section.id)}>
                                x
                            </button>
                        </h2>
                        {section.notes.map((note, i) => (
                            <div key={i}>
                                <h4>- {note.name}</h4>
                                <p>{note.content}</p>
                            </div>
                        ))}
                    </div>
                ))}
                {!addSection && (
                    <div
                        className={styles.button}
                        onClick={() => setAddSection(true)}
                    >
                        + Add Section
                    </div>
                )}
                {addSection && (
                    <SectionForm
                        toggleAdd={() => setAddSection(false)}
                        notebookId={notebook.id}
                    />
                )}
                {addSection && (
                    <div>
                        <button onClick={() => setAddSection(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({
    params,
    req,
    res,
}) => {
    const session = await getSession({ req });
    if (!session) {
        res.statusCode = 403;
        return {
            props: { notebook: undefined },
        };
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
