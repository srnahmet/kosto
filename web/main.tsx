import { createRoot } from 'react-dom/client';
import Kosto from '../app/kosto';
import '../app/globals.css';
import wordStats from 'virtual:kosto-word-stats';

const apiUrl=import.meta.env.VITE_KOSTO_API_URL||'https://kosto-bahce.srnahmet.chatgpt.site/api/room';
createRoot(document.getElementById('root')!).render(<Kosto wordStats={wordStats} apiUrl={apiUrl} appBase={import.meta.env.BASE_URL}/>);
