import { defineConfig } from 'vite'

import pkg from './package.json'
const buildDate = Date()

const headerLong = `/*!
* ${pkg.name} - ${pkg.description}
* @version ${pkg.version}
* ${pkg.homepage}
*
* @copyright ${pkg.author.name}
* @license ${pkg.license}
*
* BUILT: ${buildDate}
*/;`

export default defineConfig({
  build: {
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: 'src/svg.gridhelper.js',
      name: 'SVG',
      formats: ['umd'],
      fileName: () => `svg.gridhelper.js`,
    },
    rollupOptions: {
      output: {
        globals: {
          '@svgdotjs/svg.js': 'SVG',
        },
        banner: headerLong,
      },
      external: ['@svgdotjs/svg.js'],
    },
  },
})
