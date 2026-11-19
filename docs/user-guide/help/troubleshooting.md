# Troubleshooting

## Opening and signing in

### "Session expired"

Your Telegram session with the app has run out. Close Bitcoin Deepa and open it again from the bot.

### "Couldn't sign you in with Telegram"

This appears in a web browser when the Telegram sign-in did not complete. Tap **Sign In with Telegram** again and approve the request. If it keeps failing, tap **Open in Telegram Instead**.

### "Open This In Telegram"

The page was opened in a way that needs Telegram. Tap **Open in Telegram**.

### "Taking longer than usual…"

Your connection is slow. Wait a moment, or tap **Retry**.

### "You're offline"

The app could not reach the internet. You can still see the last data it loaded, but payments are paused. Reconnect and pull down to refresh.

### My wallet is empty, but I have used the app before

You are probably signed in with a different Telegram account. Your wallet belongs to the account you first used. Sign in with that one.

## Verification

### "Verification Required"

Plans, buying and selling need a verified identity. Tap **Complete Verification** and follow [Verify your identity](../setup/verify-your-identity.md).

### "Use Mobile Device"

Verification needs a phone camera. Open Bitcoin Deepa on your phone, sign in with the same Telegram account, and start from there.

### The Start Verification button is greyed out

One of the fields is not valid yet. The most common cause is the phone number, which must start with `+94` followed by 9 digits, such as `+94771234567`.

### My verification was declined

Tap **Start New Verification** and try again. Use a document that is not expired, make sure the whole document is in the photo and readable, and take the selfie in good light without a hat or sunglasses.

### My verification has been in review for more than 24 hours

Reviews usually finish within 24 hours. Check the status under **KYC verification** in your profile. If it is still **In review** after that, contact support.

## Payments

### "Couldn't Start Payment"

The app could not open the PayHere checkout. Check your connection and try again.

### I paid, but I don't see my bitcoin

Open the **Activity** tab and find the payment.

- **Processing** or **Pending**: the payment is still being confirmed, or the bitcoin is on its way. Give it a few minutes.
- If the purchase page said **Payment under review**, the team is checking the payment before sending your sats. This usually takes a few hours.
- **Failed** or **Cancelled**: the payment did not go through and nothing was charged.

Do not pay a second time for the same purchase while the first one is still being confirmed.

### "Payment status unknown" or "Purchase not found"

The app could not match the payment. If you paid, it will appear in **Activity** once it is confirmed. If it does not, contact support with the time and amount of the payment.

## Selling

### The Sell screen asks me to add a bank account

You need a verified bank account before your first sale. See [Add a bank account](../setup/add-a-bank-account.md).

### "Bank account in review"

Your statement is still being checked, which usually takes a few hours. You can sell as soon as the account shows **Verified**.

### My bank account was rejected

The account could not be matched to your identity. Add an account that is in your own name, with a statement that clearly shows your name and the account number.

### "Quote expired"

The price lock ran out before you confirmed. Nothing was sold. Tap **Get a new quote**.

### "Minimum is … sats" or "That's more than your balance"

The amount is outside what you can sell. Enter an amount between the minimum and your available balance, or tap **Max**.

### "We're checking this sale"

Something took longer than expected. The team is checking the sale and will contact you. Do not sell again until it is resolved.

### I can't remove my bank account

A sale to that account is still in progress. Wait until it is finished, then remove the account.

## Getting help

Ask in the Bitcoin Deepa community group, which you can open from the **Tasks** tab with **Join the Community**. When you ask for help, include:

- Your Telegram username.
- What you were doing and the exact message you saw.
- The **Transaction ID** from the Activity tab, or the **Reference** from the sale page, if it is about a payment or sale.

Never share the QR code from the bot's `/link` command, or a verification code, with anyone, including someone who says they are from support.
