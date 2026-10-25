import type {Options} from './types';
export const CATEGORY_GROUPS:{id:string;name:string;icon:string;description:string;categories:string[]}[];
export function groupFor(category:string):string|null;
export function selectedCategories(options?:Partial<Options>):string[];
export function toggleCategory(selection:string[],id:string):string[];
export function categoryLabel(options?:Partial<Options>):string;
export function matchesWord(pair:{category:string;difficulty:string},options:Partial<Options>):boolean;
