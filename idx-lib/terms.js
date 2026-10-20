/**
 * Listing search terms of use and the optional text-message box (CRM Ticket 404).
 *
 * DRAFT FOR ATTORNEY REVIEW. Written from the research in the CRM repo,
 * docs/research/2026-10-20-public-idx-legal.md. Nothing here goes live before
 * the owner and a South Carolina real estate attorney have read it.
 *
 * TERMS_VERSION must equal IDX_TERMS_VERSION in the CRM
 * (src/lib/idx/visitor.ts). The CRM refuses a sign-up on any other version,
 * and stores the exact text the dialog showed. To change the wording, bump
 * BOTH versions in the same release. Everyone signed up under the old terms
 * then sees the public view until they accept the new ones. There is no
 * "we may change these terms at any time" clause on purpose: a federal
 * appeals court covering South Carolina refused to enforce one (Dhruva v.
 * CuriosityStream, 4th Cir. 2025).
 */

export const TERMS_VERSION = "2026-10-20";

export const TERMS_TITLE = "Listing search terms of use";

/** Plain paragraphs. The dialog and /homes/terms/ both render exactly these. */
export const TERMS_PARAGRAPHS = [
  "These terms apply when you sign up for the listing search on chapter3realty.com, run by Chapter3 Realty Corp, a real estate brokerage in Myrtle Beach, South Carolina.",
  "1. Who you are. You give us your real name, email address and phone number. You are signing up for yourself, to look for a home you may buy. Your sign-up is personal to you. Do not share it.",
  "2. Personal use only. The listing information is provided by the Coastal Carolinas Association of REALTORS® Multiple Listing Service (CCMLS) for your personal, non-commercial use. You may use it only to identify homes you may want to buy. You may not copy, sell, republish, or collect it with software, scripts or any automated tool.",
  "3. Accuracy. The listing information comes from the MLS and from the brokerage firms that list each home. It is deemed reliable but is not guaranteed by the MLS or by us. Check anything that matters to you, such as size, taxes, flood zone, HOA fees and school zones, before you rely on it. Most homes shown are listed by other brokerage firms. Each listing names the firm that holds it.",
  "4. Your relationship with us. Signing up lets you see more listing information. It does not by itself make Chapter3 Realty your agent and does not obligate you to work with us. A licensed agent may contact you about homes you view or save. If you would like us to represent you, we will put that in a written agreement first.",
  "5. What we record. We record your searches and the listings you view, with the time and your IP address. The MLS requires us to keep this record and to give it to the MLS if it asks. Our Privacy Policy explains what else we collect and how to ask us to delete your information.",
  "6. Texts and calls. Signing up does not sign you up for text messages. Automated texts and calls only happen if you tick the separate text box, and you can reply STOP at any time.",
  "7. Ending access. You can stop using the search at any time and ask us to delete your sign-up. We may end your access if you break these terms, for example by collecting listings with software.",
  "8. Limits. The search is provided as is. To the extent South Carolina law allows, we are not liable for decisions you make based on listing information. This does not limit our responsibility for our own gross negligence, willful misconduct, or anything the law does not allow us to limit.",
  "9. Updates. If we change these terms, we will ask you to accept the new version before you see the full listing details again. The version you accepted applies until then.",
  "10. Contact. Questions about these terms or a listing: Chapter3 Realty Corp, (854) 333-2135, or the contact page at chapter3realty.com/contact/.",
];

/** The exact words of the optional box. Sent verbatim to the CRM when ticked. */
export const SMS_CONSENT_TEXT =
  "Text and call me (optional). I agree that Chapter 3 Realty may send me marketing and listing text messages and calls, which may use automated technology or an artificial or AI-generated voice, at the mobile number above. Consent is not a condition of signing up or of buying any property or service. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.";

/** The terms as one string, the form the CRM stores. */
export function termsText() {
  return `${TERMS_TITLE} (version ${TERMS_VERSION})\n\n${TERMS_PARAGRAPHS.join("\n\n")}`;
}
