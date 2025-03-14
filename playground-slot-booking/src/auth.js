import { SvelteKitAuth } from "@auth/sveltekit"
import Google from "@auth/sveltekit/providers/google"
import GoogleProvider from "@auth/core/providers/google"

// export const { handle, signIn, signOut } = SvelteKitAuth({
//   providers: [Google],
  
// })

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
})