import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { storage } from '../storage';

async function getOAuthClient() {
  const clientId = await storage.getSetting('GOOGLE_CLIENT_ID');
  const clientSecret = await storage.getSetting('GOOGLE_CLIENT_SECRET');

  if (!clientId?.value || !clientSecret?.value) {
    throw new Error("Google OAuth credentials must be set in settings");
  }

  return new OAuth2Client(
    clientId.value,
    clientSecret.value,
    'http://localhost:5000/api/auth/google/callback'
  );
}

export async function createGoogleCalendarEvent(appointment: {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}) {
  try {
    const oauth2Client = await getOAuthClient();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: appointment.summary,
      description: appointment.description,
      start: {
        dateTime: appointment.startTime.toISOString(),
        timeZone: 'Asia/Riyadh',
      },
      end: {
        dateTime: appointment.endTime.toISOString(),
        timeZone: 'Asia/Riyadh',
      },
      attendees: appointment.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const result = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return result.data;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    // Don't throw the error - we don't want to break appointment creation
    // if calendar sync fails
    return null;
  }
}

export async function updateGoogleCalendarEvent(eventId: string, appointment: {
  summary?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  attendees?: string[];
}) {
  try {
    const oauth2Client = await getOAuthClient();
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: appointment.summary,
      description: appointment.description,
      start: appointment.startTime ? {
        dateTime: appointment.startTime.toISOString(),
        timeZone: 'Asia/Riyadh',
      } : undefined,
      end: appointment.endTime ? {
        dateTime: appointment.endTime.toISOString(),
        timeZone: 'Asia/Riyadh',
      } : undefined,
      attendees: appointment.attendees?.map(email => ({ email })),
    };

    const result = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event,
    });

    return result.data;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    // Don't throw the error - we don't want to break appointment updates
    // if calendar sync fails
    return null;
  }
}