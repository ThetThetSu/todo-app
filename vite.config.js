import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built assets resolve correctly whether this is
  // served from a GitHub Pages project subpath (username.github.io/repo/)
  // or a custom domain at the root.
  base: './',
})
