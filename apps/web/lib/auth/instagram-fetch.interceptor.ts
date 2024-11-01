// instagram-fetch.interceptor.ts

/**
 * This interceptor is used to modify the response of the instagram access token request as it does not strictly follow the OAuth2 spec
 * - The token_type is missing in the response
 * @param originalFetch
 */
export const instagramFetchInterceptor =
  (originalFetch: typeof fetch) =>
  async (
    url: Parameters<typeof fetch>[0],
    options: Parameters<typeof fetch>[1] = {},
  ) => {
    /* Only intercept instagram access token request */
    if (
      url === "https://api.instagram.com/oauth/access_token" &&
      options.method === "POST"
    ) {
      const response = await originalFetch(url, options);
      /* Clone the response to be able to modify it */
      const clonedResponse = response.clone();
      const body = await clonedResponse.json();

      /* Get the long-lived access token */
      const longLivedAccessTokenResponse = await originalFetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${body.access_token}`,
      );
      const longLivedAccessTokenResponseBody =
        await longLivedAccessTokenResponse.json();

      body.access_token = longLivedAccessTokenResponseBody.access_token;
      body.token_type = "bearer";
      body.expires_in = longLivedAccessTokenResponseBody.expires_in;

      // Calculate the `expires_at` Unix timestamp by adding `expires_in` to the current timestamp
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds
      body.expires_at =
        currentTimestampInSeconds + longLivedAccessTokenResponseBody.expires_in;

      body.scope = "user_profile user_media"; 

      /*  Create a new response with the modified body */
      const modifiedResponse = new Response(JSON.stringify(body), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      /* Add the original url to the response */
      return Object.defineProperty(modifiedResponse, "url", {
        value: response.url,
      });
    }

    return originalFetch(url, options);
  };