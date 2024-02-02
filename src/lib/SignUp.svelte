<script lang="ts">
    import googleLogo from "../assets/google.svg";
    import appLogo from "../assets/icon.png"

    import {
        signInWithPopup,
        createUserWithEmailAndPassword,
    } from "firebase/auth";
    import { auth, googleProvider } from "./firebase";
    import { doc, setDoc } from "firebase/firestore";
    import { db } from "./firebase";

    let email: string;
    let password: string;

    async function loginGoogle() {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;

        // Create a new document in Firestore
        const userDocRef = doc(db, "accounts", user.uid);
        await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            password: null,
            joined: new Date().toISOString(),
            channels: ['N49BaUy1KqkvDGnnIIea'],
            friends: []
        });
    }

    async function signUp() {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        // Create a new document in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            // ... your user data here
        });
    }
</script>

<section>
    <div id="panel-title">
        <img src={appLogo} alt="App Logo">
        <h1>Sign in with Google</h1>
        <p>Sign in to psst! with Google to send unlimited messages to any device around the world!</p>
    </div>
    <form on:submit|preventDefault>
        <div>
            <button on:click={loginGoogle}>
                <img src={googleLogo} alt="google icon"  class="icon"/>
                <p>Continue with Google</p>
                
            </button>
        </div>
    </form>
</section>

<style>
    section {
        margin: auto;
        margin-top: 8rem;
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        font-family: "Inter";
        width: 34%;
    }

    hr {
        border: none;
        background-color: #747474;
        width: 100%;
        height: 1px;
        margin: auto 0;
    }

    button {
        width: 16rem;
        margin: 0 auto;
        height: 2rem;
        background-color: transparent;
        border: #262626 1px solid;
        border-radius: 0.2rem;
        color: black;
        display: flex;
        cursor: pointer;
        position: relative;
    }

    button >p {
        margin: auto;
    }

    .seperator {
        display: grid;
        grid-template-columns: auto 8% auto;
    }

    .seperator > p {
        text-align: center;
        margin: auto 0;
    }

    h1 {
        text-align: center;
        color: black;
        margin: 0;
        font-size: 3rem;
        font-family: "Inter";
    }

    img {
        width: 8rem;
        margin: auto auto 0.4rem auto;
    }

    .icon {
        width: 18px;
        position: absolute;
        left: 0.4rem;
        top: 50%;
        transform: translateY(-50%);
    }

    form,
    div {
        display: flex;
        gap: 8px;
        flex-direction: column;
        margin: 8px auto;
    }

    p {
        color: #262626;
        text-align: center;
        font-family: "Inter";
    }
</style>
