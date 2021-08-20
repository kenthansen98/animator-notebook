import { JuniorYouth, Lesson, Note, Notebook } from "@prisma/client";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/client";
import styles from "../../../styles/SingleNotebook.module.css";
import Layout from "../../../components/Layout";
import prisma from "../../../lib/prisma";
import { useState } from "react";

interface Props {
    notebook:
        | (Notebook & {
              juniorYouth: (JuniorYouth & {
                  notes: Note[];
                  lessonsCompleted: Lesson[];
              })[];
          })
        | null;
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

    if (!notebook) {
        return (
            <Layout>
                <div>Unauthorized</div>
            </Layout>
        );
    }

    const isChecked = (
        lessonsCompleted: Lesson[],
        currentLesson: number
    ): boolean => {
        return lessonsCompleted.find(
            (lesson) =>
                lesson.text === currentText.name &&
                lesson.lesson === currentLesson
        )
            ? true
            : false;
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
                        {notebook.juniorYouth.map((jy, i) => (
                            <tr key={i}>
                                <td>{jy.name}</td>
                                {[...Array(currentText.lessons)].map(
                                    (_col, i) => (
                                        <td key={i}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked(
                                                    jy.lessonsCompleted,
                                                    i + 1
                                                )}
                                                readOnly
                                            />
                                        </td>
                                    )
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
