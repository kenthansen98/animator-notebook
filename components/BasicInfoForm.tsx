import { useRouter } from "next/router";
import { useState } from "react";

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

interface Props {
    toggleAdd: () => void;
    notebookId: number;
}

const BasicInfoForm: React.FC<Props> = ({ toggleAdd, notebookId }) => {
    const [jyName, setJyName] = useState("");
    const [jyAge, setJyAge] = useState("");
    const [jyNotes, setJyNotes] = useState<NewNote[]>(initialNotes);
    const [jyList, setJyList] = useState<{ name: string, age: string, notes: NewNote[] }[]>([]);

    const router = useRouter();

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        try {
            const body = { jyList };
            await fetch(`http://localhost:3000/api/notebook/${notebookId}/jy`, {
                method: "PUT", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            router.replace(router.asPath);
            toggleAdd();
        } catch (e) {
            console.error(e);
        }
    }

    const onAddJy = () => {
        setJyList([...jyList, { name: jyName, age: jyAge, notes: jyNotes }]);
        setJyName("");
        setJyAge("");
        setJyNotes(initialNotes);
    };

    return (
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
                                <input type="text" placeholder="Note Name" value={note.name} onChange={(e) => setJyNotes(
                                    jyNotes.map((note, idx) => idx !== i ? note : { ...note, name: e.target.value })
                                )} />
                            </div>
                        }
                        <i>{note.helperText}</i>
                    </div>
                    <textarea
                        value={note.content}
                        placeholder="Note Content"
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
    )
};

export default BasicInfoForm;