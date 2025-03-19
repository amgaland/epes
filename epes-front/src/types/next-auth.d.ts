import NextAuth from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    token: string;
    roles: string[];
    firstname: string;
    lastname: string;
    emailPersonal: string;
    emailWork: string;
    phoneNumberPersonal: string;
    phoneNumberWork: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      token: string;
      roles: string[];
      firstname: string;
      lastname: string;
      emailPersonal: string;
      emailWork: string;
      phoneNumberPersonal: string;
      phoneNumberWork: string;
    };
  }
}
