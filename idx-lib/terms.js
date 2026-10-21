/**
 * The listing search terms of use (contract §9) and the locked TCPA string.
 *
 * DRAFT FOR THE ATTORNEY. The text below is what a visitor sees and agrees to;
 * the sign-up sends it verbatim to the CRM as termsText. After any change to
 * the wording, raise TERMS_VERSION: every signed-up visitor is then signed out
 * and accepts the new version (crm.js visitorToken).
 */

export const TERMS_VERSION = "v1-draft-1";
export const TERMS_TITLE = "Listing search terms of use";

export const TERMS_PARAGRAPHS = [
  "These terms cover the home search on chapter3realty.com, run by Chapter3 Realty, Corp., Myrtle Beach, South Carolina. You accept them by ticking the box when you sign up. They apply only after you accept them, and a new version applies only after you accept that new version.",
  "The listings come from the Coastal Carolinas Association of REALTORS® Multiple Listing Service (CCMLS). The information is deemed reliable but is not guaranteed. HOA fees, property taxes, school assignments, flood zones, square footage and other details can be out of date or wrong. Verify anything that matters to you independently before you rely on it.",
  "Most listings are listed by other brokerage firms. Each listing names its listing firm. A listing shown here is not a Chapter3 Realty listing unless its listing firm is Chapter3 Realty.",
  "You may use the search only for your own, non-commercial purpose: to find a home you may buy. You may not copy, scrape, resell or republish the listings or their photos.",
  "When you sign up we keep your name, email, phone number, the IP address and browser you used, and the version of these terms you accepted. While you are signed up we record which listings you open, how long each one is on your screen, and the homes you save with the heart. If you looked at listings before you signed up, your browser kept a short list of them, and we receive that list when you sign up.",
  "Signing up does not sign you up for texts or calls. A licensed agent may email you about homes you looked at. We text or call you only if you tick the separate, optional box that asks for that consent, and you can stop texts at any time by replying STOP.",
  "We never sell your information. Our privacy policy at chapter3realty.com/privacy/ says how we use it.",
  "To the extent the law allows, Chapter3 Realty is not liable for losses that come from relying on listing information without verifying it. This limit does not cover gross negligence or willful misconduct.",
  "These terms are governed by the laws of South Carolina.",
];

export function termsText() {
  return `${TERMS_TITLE} (version ${TERMS_VERSION})\n\n${TERMS_PARAGRAPHS.join("\n\n")}`;
}

/* Locked: byte-identical to every other form on the site (PLAYBOOK A15). Never edit. */
export const SMS_CONSENT_TEXT =
  "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
