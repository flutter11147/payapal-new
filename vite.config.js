import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],  // only babel plugin goes here
      },
    }),
    tailwindcss(),   // ✅ Tailwind Vite plugin added here
  ],
});
