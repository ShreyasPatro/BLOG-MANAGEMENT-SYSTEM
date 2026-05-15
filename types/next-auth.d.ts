import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "admin" | "writer";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: "admin" | "writer";
  }
}