import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

export interface CreateEventParams {
  bookingId: string;
  summary: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  studentEmail: string;
  expertEmail?: string;
  mode: 'online' | 'offline';
  location?: string;
}

export interface CalendarEventResult {
  eventId?: string;
  meetingLink?: string;
  htmlLink?: string;
}

class GoogleCalendarService {
  private getAuthClient() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      return null;
    }

    // Format multiline private key if needed
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    return new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: SCOPES
    });
  }

  /**
   * Creates a calendar event on Google Calendar.
   * Generates a Google Meet link if mode is 'online'.
   */
  async createCalendarEvent(params: CreateEventParams): Promise<CalendarEventResult | null> {
    try {
      const auth = this.getAuthClient();
      if (!auth) {
        console.warn('Google Calendar Service Account credentials missing in .env. Skipping Google Calendar sync.');
        return null;
      }

      const calendar = google.calendar({ version: 'v3', auth });
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      // Safely parse start and end time (supports "14:00", "14:00 - 16:00", "Lúc 14:00 - 16:00")
      let startTimeRaw = params.time ? String(params.time).trim() : '09:00';
      let endTimeRaw: string | null = null;

      if (startTimeRaw.includes('-')) {
        const parts = startTimeRaw.split('-').map((s) => s.trim());
        startTimeRaw = parts[0];
        endTimeRaw = parts[1];
      }

      const cleanTime = (t: string) => {
        const match = t.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          const h = match[1].padStart(2, '0');
          const m = match[2];
          return `${h}:${m}:00`;
        }
        return '09:00:00';
      };

      const startIsoStr = `${params.date}T${cleanTime(startTimeRaw)}+07:00`;
      const startDate = new Date(startIsoStr);

      let endDate: Date;
      if (endTimeRaw) {
        const endIsoStr = `${params.date}T${cleanTime(endTimeRaw)}+07:00`;
        const parsedEnd = new Date(endIsoStr);
        if (!isNaN(parsedEnd.getTime()) && parsedEnd.getTime() > startDate.getTime()) {
          endDate = parsedEnd;
        } else {
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default +1 hour
        }
      } else {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default +1 hour
      }

      // Build detailed description with rich formatting
      const modeText = params.mode === 'online' ? '💻 Trực tuyến (Google Meet)' : '🏢 Trực tiếp (Offline)';
      const richDescription = [
        `📌 MÃ LỊCH HẸN: #${params.bookingId}`,
        `📍 HÌNH THỨC: ${modeText}`,
        `👤 HỌC VIÊN: ${params.studentEmail}`,
        params.expertEmail ? `🎓 CHUYÊN GIA: ${params.expertEmail}` : null,
        `----------------------------------------`,
        `📝 NỘI DUNG / GHI CHÚ:`,
        params.description || 'Không có ghi chú thêm.',
        `----------------------------------------`,
        `💡 LƯU Ý DÀNH CHO THÀNH VIÊN:`,
        `• Vui lòng có mặt đúng giờ trước 5 phút.`,
        `• Chuẩn bị trước các câu hỏi và thiết bị (micro/cam) nếu tham gia trực tuyến.`,
        `• Hệ thống SS-Connect chúc bạn có một buổi làm việc hiệu quả!`
      ].filter(Boolean).join('\n');

      const eventRequestBody: any = {
        summary: `[SS-Connect] [Mã: #${params.bookingId}] ${params.summary}`,
        description: richDescription,
        location: params.location || (params.mode === 'online' ? 'Google Meet Online Call' : 'Trực tiếp tại văn phòng'),
        colorId: '9', // Blueberry / Blue color tag for SS-Connect events
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh'
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'Asia/Ho_Chi_Minh'
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'email', minutes: 60 },      // 1 hour before
            { method: 'popup', minutes: 15 }       // 15 minutes popup
          ]
        }
      };

      // Request Google Meet / Hangouts creation if online
      if (params.mode === 'online') {
        eventRequestBody.conferenceData = {
          createRequest: {
            requestId: `ssconnect-${params.bookingId}-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        };
      }

      let response;
      try {
        response = await calendar.events.insert({
          calendarId,
          requestBody: eventRequestBody,
          conferenceDataVersion: params.mode === 'online' ? 1 : 0
        });
      } catch (insertErr: any) {
        // Handle "Invalid conference type value" error for accounts/service accounts without Workspace Meet
        if (params.mode === 'online' && insertErr?.message?.includes('conference type')) {
          console.warn('hangoutsMeet not supported for this calendar. Retrying with eventHangout...');
          try {
            eventRequestBody.conferenceData.createRequest.conferenceSolutionKey.type = 'eventHangout';
            response = await calendar.events.insert({
              calendarId,
              requestBody: eventRequestBody,
              conferenceDataVersion: 1
            });
          } catch (retryErr: any) {
            console.warn('eventHangout also failed. Retrying without conference data...');
            delete eventRequestBody.conferenceData;
            response = await calendar.events.insert({
              calendarId,
              requestBody: eventRequestBody,
              conferenceDataVersion: 0
            });
          }
        } else {
          throw insertErr;
        }
      }

      const eventData = response.data;
      const meetingLink = eventData.hangoutLink || eventData.conferenceData?.entryPoints?.[0]?.uri || undefined;

      return {
        eventId: eventData.id || undefined,
        meetingLink,
        htmlLink: eventData.htmlLink || undefined
      };
    } catch (error: any) {
      console.error('Error creating Google Calendar event:', error?.message || error);
      return null;
    }
  }

  /**
   * Deletes a calendar event from Google Calendar.
   */
  async deleteCalendarEvent(eventId: string): Promise<boolean> {
    try {
      const auth = this.getAuthClient();
      if (!auth) {
        return false;
      }

      const calendar = google.calendar({ version: 'v3', auth });
      const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

      await calendar.events.delete({
        calendarId,
        eventId
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting Google Calendar event:', error?.message || error);
      return false;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
