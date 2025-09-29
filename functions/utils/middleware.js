export async function errorHandling(context) {
  const env = context.env;
  
  // Simple error handling without external dependencies for free tier
  try {
    return await context.next();
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export function telemetryData(context) {
  // Simple telemetry logging for debugging
  const { request } = context;
  console.log(`${request.method} ${request.url}`);
  return context.next();
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}