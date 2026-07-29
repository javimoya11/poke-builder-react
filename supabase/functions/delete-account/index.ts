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

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
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
      return new Response(JSON.stringify({ error: 'Invalid session.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
