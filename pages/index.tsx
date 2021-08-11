import Link from "next/link";
import { useSession } from "next-auth/client";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

export default function Home() {
    const [session, loading] = useSession();

    return (
        <Layout>
            {session && (
                <div className={styles.content}>
                    <h3>Create a notebook for your Junior Youth Group</h3>
                    <Link href="/create-notebook">
                        <a>
                            <button>+</button>
                        </a>
                    </Link>
                    <Link href="/my-notebooks">
                        <a className={styles.button}>My Notebooks</a>
                    </Link>
                </div>
            )}
        </Layout>
    );
}
