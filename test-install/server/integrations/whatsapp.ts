interface WhatsAppMessage {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: {
    body: string;
  };
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<void> {
  const settings = process.env;
  if (!settings.WHATSAPP_API_TOKEN) {
    console.warn("WhatsApp API Token not set");
    return;
  }

  if (!settings.WHATSAPP_BUSINESS_PHONE_NUMBER) {
    console.warn("WhatsApp Business Phone Number not set");
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${settings.WHATSAPP_BUSINESS_PHONE_NUMBER}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body: message }
        } as WhatsAppMessage),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WhatsApp API Error: ${error}`);
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

// Helper function to format appointment reminder message
export function formatAppointmentReminder(appointment: {
  customerName: string;
  date: string;
  time: string;
  service?: string;
}): string {
  return `تذكير بموعدك
الاسم: ${appointment.customerName}
التاريخ: ${appointment.date}
الوقت: ${appointment.time}
${appointment.service ? `الخدمة: ${appointment.service}` : ''}

لتأكيد الموعد، يرجى الرد بـ "نعم"
للإلغاء، يرجى الرد بـ "لا"`;
}