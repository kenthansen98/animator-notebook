import { useState } from "react";
import Router from "next/router";

interface Props {
    toggleAdd: () => void;
    notebookId: number;
}

const SectionForm: React.FC<Props> = ({ toggleAdd, notebookId }) => {
    const [section, setSection] = useState<{ name: string, notes: { name: string, content: string }[] }>({
        name: "",
        notes: []
    });

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        try {
            const body = { section };
            await fetch(`http://localhost:3000/api/notebook/${notebookId}/section`, {
                method: "PUT", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            setSection({ name: "", notes: [] });
            toggleAdd();
            Router.replace(Router.asPath);
        } catch (e) {
            console.error(e);
        }
    }

    return (
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
            <input disabled={section.name.length === 0 || section.notes.length === 0 || (section.notes.length > 0 && (section.notes.map(n => n.name).includes("") || section.notes.map(n => n.content).includes("")))} type="submit" value="Confirm" />
        </form>
    );
};

export default SectionForm;