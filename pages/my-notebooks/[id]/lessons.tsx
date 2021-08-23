import { JuniorYouth, Lesson, Note, Notebook } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import styles from "../../../styles/SingleNotebook.module.css";
import Layout from "../../../components/Layout";
import prisma from "../../../lib/prisma";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

interface Props {
    notebook:
        | (Notebook & {
              juniorYouth: (JuniorYouth & {
                  lessonsCompleted: Lesson[];
              })[];
          })
        | null;
}

interface NewLesson {
    text: string;
    lesson: number;
    date: Date;
}

interface NewJY {
    id: number;
    name: string;
    lessonsCompleted: NewLesson[];
}

const texts = [
    {
        name: "Breezes of Confirmation",
        lessons: 12,
    },
    {
        name: "Wellspring of Joy",
        lessons: 12,
    },
    {
        name: "Glimmerings of Hope",
        lessons: 12,
    },
    {
        name: "Habits of an Orderly Mind",
        lessons: 12,
    },
    {
        name: "Spirit of Faith",
        lessons: 12,
    },
    {
        name: "Walking the Straight Path",
        lessons: 12,
    },
    {
        name: "Thinking about Numbers",
        lessons: 12,
    },
    {
        name: "Observation and Insight",
        lessons: 12,
    },
    {
        name: "The Human Temple",
        lessons: 12,
    },
    {
        name: "Learning About Excellence",
        lessons: 12,
    },
    {
        name: "Power of the Holy Spirit",
        lessons: 12,
    },
    {
        name: "Drawing on the Power of the Word",
        lessons: 12,
    },
];

const Lessons: React.FC<Props> = ({ notebook }) => {
    const [currentText, setCurrentText] = useState(texts[0]);
    const [jyLessons, setJyLessons] = useState<NewJY[]>(
        notebook
            ? notebook?.juniorYouth.map((jy) => ({
                  id: jy.id,
                  name: jy.name!,
                  lessonsCompleted: jy.lessonsCompleted.map((lesson) => ({
                      text: lesson.text!,
                      lesson: lesson.lesson!,
                      date: lesson.date!,
                  })),
              }))!
            : []
    );

    if (!notebook) {
        return (
            <Layout>
                <div>Unauthorized</div>
            </Layout>
        );
    }

    const isChecked = (
        lessonsCompleted: NewLesson[],
        currentLesson: number
    ): NewLesson | undefined => {
        return lessonsCompleted.find(
            (lesson) =>
                lesson.text === currentText.name &&
                lesson.lesson === currentLesson
        );
    };

    const onChange = async (
        checked: boolean,
        currentJy: NewJY,
        currentLesson: number
    ) => {
        // const lesson = lessonsCompleted.find(
        //     (lesson) =>
        //         lesson.text === currentText.name &&
        //         lesson.lesson === currentLesson
        // );
        let changedJy: NewJY | undefined;
        if (checked) {
            const newLesson: NewLesson = {
                text: currentText.name,
                lesson: currentLesson,
                date: dayjs().toDate(),
            };
            const newJyLessons = jyLessons?.map((jy) => {
                const newJy =
                    jy.id !== currentJy.id
                        ? jy
                        : {
                              ...jy,
                              lessonsCompleted:
                                  jy.lessonsCompleted.concat(newLesson),
                          };
                if (newJy.id === currentJy.id) changedJy = newJy;
                return newJy;
            });
            setJyLessons(newJyLessons);
        } else {
            const newJyLessons = jyLessons.map((jy) => {
                const newJy =
                    jy.id !== currentJy.id
                        ? jy
                        : {
                              ...jy,
                              lessonsCompleted: jy.lessonsCompleted.filter(
                                  (lesson) => currentLesson !== lesson.lesson
                              ),
                          };
                if (newJy.id === currentJy.id) changedJy = newJy;
                return newJy;
            });
            setJyLessons(newJyLessons);
        }
        if (changedJy) {
            try {
                const body = { changedJy };
                const response = await fetch(
                    `http://localhost:3000/api/junioryouth/${changedJy.id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                    }
                );
                console.log(response);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <Layout>
            <div className={styles.content}>
                <h1>Lessons Completed</h1>
                <div>
                    <label htmlFor="text-select">Choose a text:</label>
                    <select
                        name="text"
                        id="text-select"
                        value={currentText.name}
                        onChange={(e) =>
                            setCurrentText(
                                texts.find((t) => t.name === e.target.value)!
                            )
                        }
                    >
                        {texts.map((text, i) => (
                            <option key={i}>{text.name}</option>
                        ))}
                    </select>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Junior Youth Names</th>
                            {[...Array(currentText.lessons)].map((_col, i) => (
                                <th key={i}>{i + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {jyLessons?.map((jy, i) => (
                            <tr key={i}>
                                <td>{jy.name}</td>
                                {[...Array(currentText.lessons)].map(
                                    (_col, i) => {
                                        const checked = isChecked(
                                            jy.lessonsCompleted,
                                            i + 1
                                        );

                                        return (
                                            <td key={i}>
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={
                                                        checked ? true : false
                                                    }
                                                    onChange={(e) =>
                                                        onChange(
                                                            e.target.checked,
                                                            jy,
                                                            i + 1
                                                        )
                                                    }
                                                />
                                                {checked && (
                                                    <strong
                                                        style={{
                                                            fontSize: "10px",
                                                        }}
                                                    >
                                                        {dayjs(
                                                            checked.date
                                                        ).format("MM/DD/YYYY")}
                                                    </strong>
                                                )}
                                            </td>
                                        );
                                    }
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
            juniorYouth: {
                include: {
                    notes: true,
                    lessonsCompleted: true,
                },
            },
        },
    });
    return {
        props: { notebook },
    };
};

export default Lessons;
