<script lang="ts">
    export let uid;
    export let displayName;
    const avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=$${uid}`;
</script>

<div class="header">
    <img src={avatar} alt="profile avatar">
    <p>{displayName}</p>
</div>

<style>
    div {
        margin: 0 8px;
        height: 11.5%;
        display: flex;
    }

    p {
        padding-top: 1px;
        padding-left: 4px;
        margin: auto 0;
    }

    img {
        width: 24px;
        margin: auto 0;
        padding: 0 8px 0 12px;
    }
</style>

