// Deletes the calling user's own Supabase Auth account.
//
// Must run server-side: deleting an auth.users row requires the
// service_role key, which must never be shipped to the client. This
// function reads the caller's identity from their own JWT (verified by the
// platform before the request reaches here) and only ever deletes that
// same user — it never accepts a target user id from the request body.
//
// `teams.user_id` and `team_pokemon.team_id` both have `on delete cascade`
// (see supabase/migrations/20260630000000_initial_schema.sql), so deleting
// the auth user automatically deletes all of their teams and team_pokemon
// rows too; no separate cleanup query is needed here.
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Required for supabase-js browser calls: the client always preflights
// with OPTIONS, and without these headers on every response (including
// the preflight) the browser blocks the request before it reaches the
// handler logic below, surfacing as "Failed to send a request to the
// Edge Function" with no further detail.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization.' }, 401);
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: 'Invalid session.' }, 401);
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      return jsonResponse({ error: deleteError.message }, 500);
    }

    return jsonResponse({ success: true }, 200);
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unknown error.' },
      500
    );
  }
});
