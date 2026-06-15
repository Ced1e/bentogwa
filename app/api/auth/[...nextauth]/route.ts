import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  session: {
    strategy: "jwt", // Uses secure JSON Web Tokens to keep users logged in
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Check if they actually typed an email and password
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // 2. Connect to MongoDB
        await connectToDatabase();

        // 3. Find the user. We use select("+password") because we hid it in the Schema!
        const user = await User.findOne({ email: credentials.email }).select("+password");

        if (!user) {
          throw new Error("No account found with this email");
        }

        // 4. Compare the typed password with the hashed password in the database
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error("Incorrect password");
        }

        // 5. If everything passes, return the user object to create the session
        return { 
          id: user._id.toString(), 
          email: user.email, 
          name: user.name 
        };
      }
    })
  ],
  pages: {
    signIn: "/", // If they are logged out, redirect them to the main page
  },
  callbacks: {
    // This attaches the user's name to the session token so we can display it on the dashboard
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name as string;
      }
      return session;
    }
  }
});

// Next.js App Router requires both GET and POST exports for the handler
export { handler as GET, handler as POST };