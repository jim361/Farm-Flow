<<<<<<< HEAD
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
=======
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
>>>>>>> 93e8ee811598782d8cc024c98d68795663e55466
