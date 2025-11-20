import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [svelte()],
    base: '/Color-Sets/',
    server: {
        host: '127.0.0.1', // Forces IPv4 to make Firefox behave, not wait 2 seconds for IPv6
    },
    preview: {
        host: '127.0.0.1', // Forces IPv4 to make Firefox behave, not wait 2 seconds for IPv6
    }
})