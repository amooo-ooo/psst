<script lang="ts">
    import { db } from "./firebase";
    import {
        collection,
        doc,
        addDoc,
        deleteDoc,
        updateDoc,
        query,
        where,
        orderBy,
        onSnapshot,
        getDoc,
    } from "firebase/firestore";
    import { writable } from "svelte/store";
    import Message from "./Message.svelte";
    import { selected, getAccountNames, message_previews } from "./states";

    let scrollBottom;
    let lastScrollTop;
    let canAutoScroll = true;
    let unreadMessages = false;

    // User ID passed from parent
    export let displayName;
    export let uid;

    // Form Text
    let text: string;
    let q;
    let server = writable({}); // Create a writable store for server data
    let messages = writable([]);

    function getServerData() {
        const docRef = doc(db, "channels", $selected.id);
        onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                server.set(docSnap.data());
            } else {
                console.log("No such document!");
            }
        });
    }

    // Query requires an index
    let renameTitle: boolean;
    $: {
        if ($server.name && !renameTitle && $selected) {
            document.title = `psst! - ${$selected.participant_names}`;
            renameTitle = true;
        }

        if ($selected) {
            q = query(
                collection(db, "channels", $selected.id, "messages"),
                orderBy("sent"),
            );
            getServerData();
            onSnapshot(q, async (snapshot) => {
                let data = [];
                let section = [];
                let author;
                let authorId;
                let ts;

                for (let doc of snapshot.docs) {
                    const messageData = doc.data();
                    // Check if different author or time difference is over 60 minutes
                    if (
                        messageData.authorId != authorId ||
                        timeDifference(ts, messageData.sent) >= 60
                    ) {
                        data.push({
                            authorName: author,
                            authorId: authorId,
                            messages: section,
                            sent: ts,
                        });
                        section = [
                            {
                                id: doc.id,
                                text: messageData.text,
                                sent: messageData.sent,
                            },
                        ];
                        author = messageData.authorName;
                        authorId = messageData.authorId;
                    } else {
                        section.push({
                            id: doc.id,
                            text: messageData.text,
                            sent: messageData.sent,
                        });
                    }
                    ts = messageData.sent;
                }
                data.push({
                    authorName: author,
                    authorId: authorId,
                    messages: section,
                    sent: ts,
                });

                messages.set(data.slice(1));
            });
        }
    }

    function timeDifference(ts1, ts2) {
        let t1 = new Date(ts1);
        let t2 = new Date(ts2);
        return Math.abs(t1 - t2) / 1000 / 60;
    }

    function autoScroll() {
        setTimeout(
            () => scrollBottom?.scrollIntoView({ behavior: "auto" }),
            50,
        );
        unreadMessages = false;
    }

    function watchScroll(e) {
        canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
        lastScrollTop = e.target.scrollTop;
    }

    async function sendMessage(e) {
        let temp = text;
        text = "";
        e.preventDefault();
        if (temp.trim() === "") return;
        await addDoc(collection(db, "channels", $selected.id, "messages"), {
            text: temp,
            authorId: uid,
            authorName: displayName,
            sent: new Date().toISOString(),
        });
    }

    function formatDate(isoDateString) {
        const inputDate = new Date(isoDateString);
        const today = new Date();
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];

        // Check if the input date is today
        if (inputDate.toDateString() === today.toDateString()) {
            return `Today, ${inputDate.getHours()}:${
                inputDate.getMinutes() < 10 ? "0" : ""
            }${inputDate.getMinutes()} ${
                inputDate.getHours() >= 12 ? "PM" : "AM"
            }`;
        }

        // Check if the input date is within this week
        const dayDiff = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24));
        if (dayDiff < 7 && inputDate.getDay() <= today.getDay()) {
            return `${days[inputDate.getDay()]}, ${inputDate.getHours()}:${
                inputDate.getMinutes() < 10 ? "0" : ""
            }${inputDate.getMinutes()} ${
                inputDate.getHours() >= 12 ? "PM" : "AM"
            }`;
        }

        // If the input date is not today and not within this week
        return `${inputDate.getDate() < 10 ? "0" : ""}${inputDate.getDate()}/${
            inputDate.getMonth() + 1 < 10 ? "0" : ""
        }${inputDate.getMonth() + 1}/${inputDate.getFullYear()}`;
    }
</script>

<div class="container">
    {#if $selected}
        <div class="header">
            <h1>
                <span style="color: #6e6e6e; font-weight: 400;"
                    >To:
                </span>{$selected.participant_names}
            </h1>
        </div>
        <main on:scroll={watchScroll}>
            {#each $messages as message, index (message.sent)}
                {#if index == 0}
                    <time>{formatDate(message.messages[0].sent)}</time>
                {:else if $messages[index].authorId == $messages[index - 1].authorId}
                    <time>{formatDate(message.messages[0].sent)}</time>
                {/if}
                <Message {message} {uid} />
            {/each}

            <div class="dummy" bind:this={scrollBottom} />
        </main>

        <form on:submit|preventDefault={sendMessage}>
            <input
                type="text"
                placeholder="Message {$selected.participant_names}!"
                bind:value={text}
                maxlength="1000"
            />
        </form>
    {/if}
</div>
