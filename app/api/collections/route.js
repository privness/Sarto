import { getServerSession } from 'next-auth';
import { getUser, getCollections, createCollection, deleteCollection, addToCollection, removeFromCollection } from '@/lib/db';
async function getSessionUser() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  return await getUser(session.user.email);
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (!user.is_premium) return Response.json({ error: 'Premium required' }, { status: 403 });
  
  const collections = await getCollections(user.id);
  return Response.json({ collections });
}

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (!user.is_premium) return Response.json({ error: 'Premium required' }, { status: 403 });
  
  const { action, name, description, collectionId, product, productId } = await request.json();
  
  if (action === 'create' && name) {
    const collection = await createCollection(user.id, name, description);
    return Response.json({ success: true, collection });
  }
  
  if (action === 'delete' && collectionId) {
    await deleteCollection(collectionId, user.id);
    return Response.json({ success: true });
  }
  
  if (action === 'addItem' && collectionId && product) {
    await addToCollection(collectionId, product);
    return Response.json({ success: true });
  }
  
  if (action === 'removeItem' && collectionId && productId) {
    await removeFromCollection(collectionId, productId);
    return Response.json({ success: true });
  }
  
  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
