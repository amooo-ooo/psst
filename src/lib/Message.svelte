<script lang="ts">
    import { db } from "./firebase";
    import { updateDoc, doc } from "firebase/firestore";
    export let message: object;
    export let uid: string;

    const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=$${message.authorId}`;
    let image_extension = [".png", ".svg", ".webp", ".jpg", ".gif"];

    function getTime() {
        let time = new Date(message.sent);
        return time.toLocaleString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
</script>

<div class={`message`}>
    <div class="message-content {message.authorId == uid ? "author" : "other"}">
        {#each message.messages as content, index}
            {#if image_extension.some( (extension) => content.text.endsWith(extension), )}
                <img
                    class="sent"
                    src={content.text}
                    alt="Image sent by {message.authorName}."
                />
                <br />
            {:else}
                <p class={index == message.messages.length - 1 ? "tail" : ""}>{content.text}</p>
            {/if}
        {/each}
    </div>
</div>
