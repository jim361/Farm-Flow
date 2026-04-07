import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path' // 수정

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
// 수정
resolve: {
  alias: {
    'react': path.resolve('./node_modules/react'),
    'react-dom': path.resolve('./node_modules/react-dom'),
  }
}
})
