import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions, User } from "next-auth";
import { serverRequest } from "@/app/api/serverRequest";

interface ServiceUser extends User {
  id: string;
  username: string;
  token: string;
  roles: string[];
  firstname: string;
  lastname: string;
  email_personal: string;
  email_work: string;
  phone_number_personal: string;
  phone_number_work: string;
  is_active: boolean;
  active_start_date: string;
  active_end_date: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials.password) {
          return null;
        }

        try {
          const response = await serverRequest("POST", "/auth/signin", {
            login_id: credentials?.username,
            password: credentials?.password,
          });

          if (response.status === 200 && response.data) {
            const user: ServiceUser = {
              id: response.data.id,
              username: credentials.username,
              token: response.data.token,
              roles: response.data.roles,
              firstname: response.data.first_name,
              lastname: response.data.last_name,
              email_personal: response.data.email_personal,
              email_work: response.data.email_work,
              phone_number_personal: response.data.phone_number_personal,
              phone_number_work: response.data.phone_number_work,
              is_active: response.data.is_active,
              active_start_date: response.data.active_start_date,
              active_end_date: response.data.active_end_date,
            };
            return user;
          } else {
            console.error(`Login failed: ${response.statusText}`);
            return null;
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as ServiceUser;
        token.id = customUser.id;
        token.username = customUser.username;
        token.token = customUser.token;
        token.roles = customUser.roles;
        token.firstname = customUser.firstname;
        token.lastname = customUser.lastname;
        token.emailPersonal = customUser.email_personal;
        token.emailWork = customUser.email_work;
        token.phoneNumberPersonal = customUser.phone_number_personal;
        token.phoneNumberWork = customUser.phone_number_work;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id || "",
          username: token.username || "",
          token: token.token || "",
          roles: token.roles || [],
          firstname: token.firstname || "",
          lastname: token.lastname || "",
          emailPersonal: token.emailPersonal || "",
          emailWork: token.emailWork || "",
          phoneNumberPersonal: token.phoneNumberPersonal || "",
          phoneNumberWork: token.phoneNumberWork || "",
        };
      }
      return session;
    },
  },
};
