# Contact Us page

## What it does

Creates a **Contact** page with form or mailto, validation, spam protection hooks, and routing.

## Default behavior

Client or server actions per stack; rate limiting on API if backend endpoint used.

## Customization options

`--twilio` for SMS follow-up; `--backend` for ticket persistence.

## Example queue command

`/queue-prompt --contact-us "Use Resend/SES endpoint + honeypot field"`

## Example pickup command

`/pickup-prompt --contact-us`

## Output location

`frontend/app/(marketing)/contact`, API route if any.

## Agent ownership

**Frontend** + **Backend** (if API).

## Related

- [footer.md](../components/footer.md)
