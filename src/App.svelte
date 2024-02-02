<script>
  import Chat from "./lib/Chat.svelte";
  import Contacts from "./lib/Contacts.svelte";
  import SignUp from "./lib/SignUp.svelte";

  import { signOut } from "firebase/auth";
  import { onAuthStateChanged } from "firebase/auth";
  import { auth } from "./lib/firebase";

  let user;
  const unsubscribe = onAuthStateChanged(auth, (u) => (user = u));
</script>

{#if user}
<div id="main">
    <Contacts {...user}/>
    <Chat {...user} />
  </div>
{:else}
  <SignUp />
{/if}
