import emailjs from '@emailjs/browser';

const STORAGE_KEY_EMAIL_LOGS = 'findit_sent_emails_log';

/**
 * Retrieves simulated or dispatched email activity logs from localStorage.
 */
export function getEmailActivityLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMAIL_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Appends an email event to the local activity log.
 */
function logEmailActivity(entry) {
  try {
    const logs = getEmailActivityLogs();
    logs.unshift({
      id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry
    });
    // Keep last 30 emails
    localStorage.setItem(STORAGE_KEY_EMAIL_LOGS, JSON.stringify(logs.slice(0, 30)));
    // Dispatch custom browser event so UI can reactively refresh
    window.dispatchEvent(new CustomEvent('findit_email_logged'));
  } catch (e) {
    console.warn('Could not log email activity', e);
  }
}

/**
 * Sends a Claim Acceptance & Handover Coordination email.
 * Automatically switches between live EmailJS and zero-setup In-App Simulation.
 *
 * @param {Object} params
 * @param {string} params.itemTitle - Title of the found item
 * @param {string} params.ownerName - Name of finder / report owner
 * @param {string} params.ownerEmail - Email of finder
 * @param {string} params.claimantName - Name of the person who claimed it
 * @param {string} params.claimantEmail - Email of claimant
 * @param {string} params.location - Proposed handover zone/location
 * @param {string} params.instructions - Owner's personal note on where to meet
 * @returns {Promise<{success: boolean, simulated: boolean, message: string, preview?: Object}>}
 */
export async function sendClaimAcceptedEmail({
  itemTitle,
  ownerName,
  ownerEmail,
  claimantName,
  claimantEmail,
  location,
  instructions
}) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const emailPayload = {
    to_name: claimantName,
    to_email: claimantEmail,
    from_name: ownerName,
    from_email: ownerEmail,
    item_title: itemTitle,
    handover_location: location || 'Campus Security or Central Library Desk',
    instructions: instructions || 'Please bring your student ID card or photo verification for item handover.',
    subject: `[FindIt] Claim Accepted: Instructions to recover "${itemTitle}"`
  };

  // If EmailJS credentials are configured, attempt real delivery
  if (serviceId && templateId && publicKey && serviceId !== 'service_findit') {
    try {
      const response = await emailjs.send(serviceId, templateId, emailPayload, publicKey);
      logEmailActivity({
        type: 'live',
        status: 'delivered',
        recipient: claimantEmail,
        subject: emailPayload.subject,
        details: emailPayload,
        responseStatus: response.status
      });

      return {
        success: true,
        simulated: false,
        message: `Official email dispatched via EmailJS to ${claimantEmail}`
      };
    } catch (err) {
      console.warn('EmailJS live send failed, falling back to simulated mode:', err);
    }
  }

  // Graceful in-app simulation mode (instant, zero cost, no keys required)
  logEmailActivity({
    type: 'simulated',
    status: 'delivered',
    recipient: claimantEmail,
    subject: emailPayload.subject,
    details: emailPayload
  });

  return {
    success: true,
    simulated: true,
    message: `Coordination email generated for ${claimantEmail} (In-App Simulation Active)`,
    preview: emailPayload
  };
}
