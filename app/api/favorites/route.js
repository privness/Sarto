import { getServerSession } from 'next-auth';

async function getSessionUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  const { getUser } = await import('../../../lib/db.js');
  return await getUser(session.user.email);
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  
  const { getFavorites } = await import('../../../lib/db.js');
  const favorites = await getFavorites(user.id);
  return Response.json({ favorites });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  
  const { action, product, productId } = await request.json();
  
  if (action === 'add' && product) {
    const { addFavorite } = await import('../../../lib/db.js');
    await addFavorite(user.id, product);
    return Response.json({ success: true });
  }
  
  if (action === 'remove' && productId) {
    const { removeFavorite } = await import('../../../lib/db.js');
    await removeFavorite(user.id, productId);
    return Response.json({ success: true });
  }
  
  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
