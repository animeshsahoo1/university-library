import { authOptions } from "@/auth";
import NextAuth from "next-auth";

const {handlers, auth, signIn, signOut} = authOptions;

export { handlers as GET, handlers as POST };

export {auth, signIn, signOut}