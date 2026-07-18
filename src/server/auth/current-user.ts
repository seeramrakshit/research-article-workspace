import { auth } from "../auth";

export class UnauthenticatedError extends Error {
  constructor() {
    super("You must be signed in.");
    this.name = "UnauthenticatedError";
  }
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }
  return session.user.id;
}