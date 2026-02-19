import { getServerSession } from 'next-auth';
import { getUser, getFavorites, addFavorite, removeFavorite } from '@/lib/db';
async function getSessionUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  return await getUser(session.user.email);
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  
  const favorites = await getFavorites(user.id);
  return Response.json({ favorites });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  
  const { action, product, productId } = await request.json();
  
  if (action === 'add' && product) {
    await addFavorite(user.id, product);
    return Response.json({ success: true });
  }
  
  if (action === 'remove' && productId) {
    await removeFavorite(user.id, productId);
    return Response.json({ success: true });
  }
  
  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
