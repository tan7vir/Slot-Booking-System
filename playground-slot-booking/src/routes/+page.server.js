/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
  const session = await event.locals.auth();
  return {
    session,
  };
}


