<script type="ts">
    import { db } from "./firebase";
    import plusIcon from "../assets/plus.svg";
    import {
        collection,
        doc,
        query,
        where,
        onSnapshot,
        getDocs,
        documentId,
        getDoc,
        orderBy,
        limitToLast,
        updateDoc,
        setDoc,
        arrayUnion,
    } from "firebase/firestore";
    import { writable } from "svelte/store"; // Import writable
    import { selected, getAccountNames, newContact, message_previews } from "./states";
    export let uid;
    export let displayName;

    let user = writable({}); // Make user a Svelte store
    let channels = writable([]); // Make channels a Svelte store
    let user_search;

    function getServerData() {
        const docRef = doc(db, "accounts", uid);
        onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                user.set(docSnap.data());
                fetchChannels($user.channels); // Fetch channels here
            } else {
                console.log("No such document!");
            }
        });
    }
    getServerData();
    let listeners = [];

    $: {
        // Remove old listeners
        listeners.forEach((unsubscribe) => unsubscribe());
        listeners = [];

        // Add new listeners
        $channels.forEach((item, index) => {
            let msg_q = query(
                collection(db, "channels", item.id, "messages"),
                orderBy("sent"),
                limitToLast(1),
            );
            let unsubscribe = onSnapshot(msg_q, async (snapshot) => {
                if (!snapshot.empty) {
                    $channels = $channels.map((channel, i) => {
                        if (i === index) {
                            return {
                                ...channel,
                                message: snapshot.docs[0].data(),
                            };
                        }
                        return channel;
                    });
                }
            });

            listeners.push(unsubscribe);
        });
    }

    // $: {
    //     // Add new listeners
    //     $channels.forEach((item, index) => {
    //         return {
    //             ...item,
    //             message: ($message_previews[item.id] ? $message_previews[item.id] : "..."),
    //         };
    //     });
    // }
    async function fetchChannels(channelIds) {
        let channelsData = [];
        for (let channelId of channelIds) {
            const channelRef = doc(db, "channels", channelId);
            const docSnap = await getDoc(channelRef);
            if (docSnap.exists()) {
                let channelData = { id: docSnap.id, ...docSnap.data() };
                channelData.participant_names = await getAccountNames(
                    channelData.participants, uid
                );
                channelsData.push(channelData);
            }
        }
        channels.set(channelsData); // Update channels store
        selected.set(channelsData[0])
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
            return `${inputDate.getHours()}:${
                inputDate.getMinutes() < 10 ? "0" : ""
            }${inputDate.getMinutes()} ${
                inputDate.getHours() >= 12 ? "PM" : "AM"
            }`;
        }

        // Check if the input date is within this week
        const dayDiff = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24));
        if (dayDiff < 7 && inputDate.getDay() <= today.getDay()) {
            return days[inputDate.getDay()];
        }

        // If the input date is not today and not within this week
        return `${inputDate.getDate() < 10 ? "0" : ""}${inputDate.getDate()}/${
            inputDate.getMonth() + 1 < 10 ? "0" : ""
        }${inputDate.getMonth() + 1}/${inputDate.getFullYear()}`;
    }

    let email = "";
    async function createChannel(userId, otherUserId) {
        // Generate a new document ID
        const channel = doc(collection(db, "channels"));

        // Create a new document in the 'channels' collection
        await setDoc(doc(db, "channels", channel.id), {
            participants: [userId, otherUserId],
            // Add any other fields you need
        });

        // Update the 'channels' field of the user and the other user
        const userRef = doc(db, "accounts", userId);
        const otherUserRef = doc(db, "accounts", otherUserId);

        await updateDoc(userRef, {
            channels: arrayUnion(channel.id),
        });

        await updateDoc(otherUserRef, {
            channels: arrayUnion(channel.id),
        });

        return channel;
    }

    async function checkAccountExistsByEmail(email) {
        const q = query(
            collection(db, "accounts"),
            where("email", "==", email),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            selected.set(createChannel(uid, querySnapshot.docs[0].id));
        } else {
            alert("No such account!");
        }
    }
</script>

<div class="contacts">
    <div>
        <section class="header">
            <button class="icon" on:click={() => newContact.set(!$newContact)}>
                <span class="material-symbols-rounded"> edit_square </span>
            </button>
            <!-- {#if $newContact}
            <NewContact></NewContact>
        {/if} -->
        </section>
        <section class="channel-section">
            <form
                on:submit|preventDefault={() => (
                    checkAccountExistsByEmail(email), (email = "")
                )}
            >
                <span class="material-symbols-rounded"> search </span>
                <input
                    type="text"
                    placeholder="Search"
                    bind:value={email}
                    maxlength="100"
                />
            </form>
        </section>
        <section class="channels" id="gc">
            {#each $channels as channel}
                <button
                    on:click={() => selected.set(channel)}
                    class="{$selected.id == channel.id ? 'active' : ''} channel"
                >
                    <img
                        class="avatar"
                        src="https://api.dicebear.com/7.x/initials/svg?seed={channel.participant_names}"
                        alt="channel avatar"
                    />
                    <div class="textholder">
                        {#if channel.message}
                            <div class="title">
                                <p>{channel.participant_names}</p>
                                <time>{formatDate(channel.message.sent)}</time>
                            </div>
                            <p>{channel.message.text}</p>
                        {/if}
                    </div>
                </button>
            {/each}
        </section>
    </div>
</div>
