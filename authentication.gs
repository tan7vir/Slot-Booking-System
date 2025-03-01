function validateGoogleToken(token) {
  try {
    // Step 1: Fetch token info from Google's token validation endpoint
    const response = UrlFetchApp.fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const tokenInfo = JSON.parse(response.getContentText());

    // Step 2: Verify the token's audience matches your Client ID
    const expectedClientId = "Your-Token_here"; // Replace with your Client ID
    if (tokenInfo.aud !== expectedClientId) {
      throw new Error("Invalid token audience");
    }

    // Step 3: Return the user's email and other details
    return {
      email: tokenInfo.email,
      name: tokenInfo.name,
      picture: tokenInfo.picture
    };
  } catch (error) {
    // Handle errors during token validation
    console.error("Error validating token:", error.message);
    return { error: "Invalid token" };
  }
}