import { TOKEN } from "@/lib/token";

type ResetMail = {
  to: string;
  name: string;
  url: string;
};

function fromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || `${TOKEN.name} <beth.t@example.com>`;
}

export async function sendResetPasswordEmail({ to, name, url }: ResetMail): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const runner = name.trim() || "runner";
  const html = `
    <p>Floor pass reset for ${runner}.</p>
    <p><a href="${url}">Choose a new password</a></p>
    <p>This link expires in one hour. If you did not ask for it, ignore this email.</p>
  `;

  if (!key) {
    console.warn(
      "[auth] RESEND_API_KEY is not set. Password reset was stored, but no email was sent.",
      process.env.DATABASE_URL?.trim() ? "" : `Local reset URL: ${url}`,
    );
    if (process.env.DATABASE_URL?.trim()) {
      throw new Error("Password reset email is not configured.");
    }
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to,
      subject: `Reset your ${TOKEN.name} password`,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Could not send reset email (${res.status}): ${detail}`);
  }
}
