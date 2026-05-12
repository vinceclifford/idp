# backend/email_service.py
import os
import smtplib
import json
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Resend (HTTP API — preferred when configured)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM = os.getenv("RESEND_FROM", "CoachHub <onboarding@resend.dev>")

# SMTP fallback configuration
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM = os.getenv("SMTP_FROM", "noreply@coachhub.com")

# The frontend base URL (adjust as needed for production)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _send_via_resend(to: str, subject: str, text_body: str) -> bool:
    """Send an email via Resend's HTTP API. Returns True on success."""
    payload = json.dumps({
        "from": RESEND_FROM,
        "to": [to],
        "subject": subject,
        "text": text_body,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "CoachHub/1.0 (+https://coachhub.local)",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if 200 <= resp.status < 300:
                print(f"Resend: email sent to {to} (status {resp.status})")
                return True
            print(f"Resend: unexpected status {resp.status} sending to {to}")
            return False
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"Resend HTTPError {e.code} sending to {to}: {body}")
        return False
    except Exception as e:
        print(f"Resend send failed for {to}: {e}")
        return False

def send_verification_email(email: str, token: str):
    """Sends an account verification email or logs it if SMTP is not configured."""
    verify_link = f"{FRONTEND_URL}/?verify_token={token}"

    subject = "CoachHub - Verify your email"
    body = f"""
    Welcome to CoachHub!

    Please verify your email address by clicking the link below:

    {verify_link}

    This link will expire in 24 hours.
    If you did not sign up, you can safely ignore this email.

    Best regards,
    The CoachHub Team
    """

    if RESEND_API_KEY:
        return _send_via_resend(email, subject, body)

    if not SMTP_HOST:
        print("\n" + "=" * 50)
        print("PRODUCTION WARNING: No email provider configured!")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"Verification Link: {verify_link}")
        print("=" * 50 + "\n")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"Verification email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"Error sending verification email to {email}: {e}")
        return False


def send_reset_password_email(email: str, token: str):
    """Sends a password reset email or logs it if SMTP is not configured."""
    reset_link = f"{FRONTEND_URL}/?token={token}"
    
    subject = "CoachHub - Password Reset"
    body = f"""
    Hello,
    
    You have requested to reset your password for CoachHub.
    Please click the link below to set a new password:
    
    {reset_link}
    
    This link will expire in 1 hour.
    If you did not request this reset, please ignore this email.
    
    Best regards,
    The CoachHub Team
    """

    if RESEND_API_KEY:
        return _send_via_resend(email, subject, body)

    if not SMTP_HOST:
        print("\n" + "="*50)
        print("PRODUCTION WARNING: No email provider configured!")
        print(f"To: {email}")
        print(f"Subject: {subject}")
        print(f"Reset Link: {reset_link}")
        print("="*50 + "\n")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"Reset email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"Error sending email to {email}: {e}")
        # In a real app, you might want to log this or re-raise
        return False
