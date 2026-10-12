import { runtime } from '../../../lib/scroll-preview-runtime.mjs';
export function getStaticPaths() {
  return ['boot','portfolio','head'].map(runtime => ({params:{runtime:runtime+".js"}}));
}
export function GET({params}) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return new Response(runtime(params.runtime.replace(/\.js$/, ""), base), {headers:{'Content-Type':'application/javascript; charset=utf-8'}});
}
