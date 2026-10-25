import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const project=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({
  root:resolve(project,'web'),
  base:'/kosto/',
  publicDir:resolve(project,'public'),
  resolve:{alias:{'@':project}},
  plugins:[react(),{
    name:'kosto-public-word-stats',
    resolveId(id){if(id==='virtual:kosto-word-stats')return '\0'+id;},
    load(id){
      if(id!=='\0virtual:kosto-word-stats')return;
      // Categories/count only. Never bundle the server's word pairs or game state.
      const words=JSON.parse(readFileSync(resolve(project,'data/words.json'),'utf8')) as {category:string}[];
      return `export default ${JSON.stringify({count:words.length,categories:[...new Set(words.map(w=>w.category))].sort((a,b)=>a.localeCompare(b,'tr'))})};`;
    },
  }],
  build:{outDir:resolve(project,'dist-pages'),emptyOutDir:true},
});

