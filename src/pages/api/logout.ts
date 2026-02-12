import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('wp_jwt', { path: '/' });
  cookies.delete('wp_user_display', { path: '/' });
  return redirect('/inversores');
};