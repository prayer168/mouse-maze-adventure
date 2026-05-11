import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When running inside GitHub Actions, GITHUB_ACTIONS='true' is set automatically.
// We use this to apply the correct subpath for GitHub Pages deployment.
// For a repo at https://github.com/USER/mouse-maze-adventure the published URL is
// https://USER.github.io/mouse-maze-adventure/ — so base must match the repo name.
//
// Local dev  (`npm run dev`)   — base is './' → works as usual
// CI build   (`npm run build`) — base is '/mouse-maze-adventure/' → correct for GH Pages
// Local build/preview          — base is './' → `vite preview` works fine
const base = process.env.GITHUB_ACTIONS ? '/mouse-maze-adventure/' : './'

export default defineConfig({
  plugins: [react()],
  base,
})
