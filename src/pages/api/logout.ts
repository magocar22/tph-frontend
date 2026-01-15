import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('jwt', { path: '/' });
  cookies.delete('username', { path: '/' });
  return redirect('/inversores');
};