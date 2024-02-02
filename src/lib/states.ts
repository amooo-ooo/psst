import { writable } from "svelte/store";
export const selected = writable();
export const newContact = writable(false);
export const message_previews = writable({});

import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getAccountNames(accountIds: string, excludeId: string) {
    let accountNames = [];
    for (let id of accountIds) {
        if (id !== excludeId) {
            const docRef = doc(db, "accounts", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                accountNames.push(docSnap.data().name);
            }
        }
    }

    return accountNames.join(" ");
}