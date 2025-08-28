// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'src',
  base: '/',
  publicDir: '../public',
  envDir: '../',          // <— add this so Vite reads ../.env*
})
