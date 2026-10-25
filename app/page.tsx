import Kosto from './kosto';
import { wordStats } from '@/lib/store';
export default function Home() { return <Kosto wordStats={wordStats}/>; }
