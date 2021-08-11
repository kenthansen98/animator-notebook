import { useSession } from "next-auth/client";
import Router from "next/router";
import React, { useState } from "react";
import Layout from "../components/Layout";

const CreateNotebook = () => {
    const [session, loading] = useSession();

    const [name, setName] = useState("");


    if (!session) {
        return (
            <Layout>
                <div>Unauthorized</div>
            </Layout>
        )
    }

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        try {
            const body = { name };
            await fetch("/api/notebook", {
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(body),
            });
            await Router.push("/my-notebooks");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout>
            <form onSubmit={onSubmit}>
                <h2>New Notebook</h2>
                <input 
                    autoFocus
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Notebook Name"
                    type="text"
                    value={name}
                />
                <input disabled={!name} type="submit" value="Create"/>
            </form>
        </Layout>
    )
};

export default CreateNotebook;