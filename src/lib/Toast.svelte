<script lang="ts">
    let { message, visible, success, x, y } = $props();
</script>

<div class="copy-notification {visible ? 'show' : 'hide'}" role="alert" aria-live="polite" style="top: {y}px; left: {x}px; background-color: {success ? 'var(--notification-bg-color)' : 'var(--notification-fail-bg-color)'}">
    {message}
</div>

<style>
    .copy-notification {
        position: fixed;
        background-color: var(--notification-bg-color);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        opacity: 0;
        transition:
            opacity 0.3s ease-in-out,
            transform 0.3s ease-in-out;
        pointer-events: none;
        transform: translate(-50%, -50%);
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .copy-notification.show {
        opacity: 1;
        transform: translate(-50%, calc(-100% - 10px));
    }

    .copy-notification.hide {
        opacity: 0;
        transform: translate(-50%, -50%);
    }
</style>
