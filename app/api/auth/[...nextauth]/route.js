import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const { getOrCreateUser } = await import('../../../../lib/db.js');
        await getOrCreateUser(user.email, user.name, user.image);
        return true;
      } catch (err) {
        console.error('Sign in error:', err);
        return true;
      }
    },
    async session({ session }) {
      if (session?.user?.email) {
        try {
          const { getUser } = await import('../../../../lib/db.js');
          const dbUser = await getUser(session.user.email);
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.isPremium = dbUser.is_premium;
          }
        } catch (err) {
          console.error('Session error:', err);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
