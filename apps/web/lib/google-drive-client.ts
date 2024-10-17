import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const drive = google.drive({ version: 'v3', auth: oauth2Client });