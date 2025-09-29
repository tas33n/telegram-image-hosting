export function isAuthorized(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  try {
    const credentials = atob(authHeader.slice(6));
    const [username, password] = credentials.split(":");
    return (
      username === env.ADMIN_USERNAME &&
      password === env.ADMIN_PASSWORD
    );
  } catch (error) {
    console.error("Auth decode error", error);
    return false;
  }
}

export function requireAuth(request, env) {
  if (!isAuthorized(request, env)) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": "Basic realm=\"Dashboard\"",
      },
    });
  }

  return null;
}
