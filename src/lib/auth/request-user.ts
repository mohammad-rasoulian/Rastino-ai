import { getCurrentUser } from "@/lib/auth/current-user";

export class UnauthorizedError extends Error {
  status = 401;
  code = "UNAUTHORIZED";

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return (
    error instanceof UnauthorizedError ||
    (error instanceof Error && error.name === "UnauthorizedError")
  );
}

export function unauthorizedResponse() {
  return Response.json(
    {
      error: "برای انجام این عملیات باید وارد حساب کاربری شوید.",
      code: "UNAUTHORIZED",
    },
    { status: 401 }
  );
}

export async function getRequestUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new UnauthorizedError();
  }

  return currentUser;
}
