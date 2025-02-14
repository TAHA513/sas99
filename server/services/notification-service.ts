import { sendWhatsAppMessage, formatAppointmentReminder } from '../integrations/whatsapp';
import { createGoogleCalendarEvent, updateGoogleCalendarEvent } from '../integrations/google-calendar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Appointment, Customer, Staff } from '@shared/schema';

export class NotificationService {
  async handleAppointmentCreated(
    appointment: Appointment,
    customer: Customer,
    staff: Staff
  ) {
    try {
      // Send WhatsApp notification
      if (customer.phone) {
        const formattedDate = format(new Date(appointment.startTime), 'dd MMMM yyyy', { locale: ar });
        const formattedTime = format(new Date(appointment.startTime), 'HH:mm');
        
        await sendWhatsAppMessage(
          customer.phone,
          formatAppointmentReminder({
            customerName: customer.name,
            date: formattedDate,
            time: formattedTime,
          })
        );
      }

      // Create Google Calendar event
      if (customer.email) {
        await createGoogleCalendarEvent({
          summary: `موعد: ${customer.name}`,
          description: appointment.notes || '',
          startTime: new Date(appointment.startTime),
          endTime: new Date(appointment.endTime),
          attendees: [customer.email],
        });
      }
    } catch (error) {
      console.error('Error in handleAppointmentCreated:', error);
      // Don't throw the error - we don't want to break the appointment creation
      // if notifications fail
    }
  }

  async handleAppointmentUpdated(
    appointment: Appointment,
    customer: Customer,
    staff: Staff,
    googleCalendarEventId?: string
  ) {
    try {
      // Send WhatsApp notification about the update
      if (customer.phone) {
        const formattedDate = format(new Date(appointment.startTime), 'dd MMMM yyyy', { locale: ar });
        const formattedTime = format(new Date(appointment.startTime), 'HH:mm');
        
        await sendWhatsAppMessage(
          customer.phone,
          `تم تحديث موعدك:\n${formatAppointmentReminder({
            customerName: customer.name,
            date: formattedDate,
            time: formattedTime,
          })}`
        );
      }

      // Update Google Calendar event
      if (googleCalendarEventId && customer.email) {
        await updateGoogleCalendarEvent(googleCalendarEventId, {
          summary: `موعد: ${customer.name}`,
          description: appointment.notes || '',
          startTime: new Date(appointment.startTime),
          endTime: new Date(appointment.endTime),
          attendees: [customer.email],
        });
      }
    } catch (error) {
      console.error('Error in handleAppointmentUpdated:', error);
    }
  }
}

export const notificationService = new NotificationService();
