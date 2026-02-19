import { initDb } from '@/lib/db';
export async function GET() {
  try {
    await initDb();
    return Response.json({ success: true, message: 'Database tables created' });
  } catch (error) {
    console.error('DB init error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
