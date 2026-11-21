# Wallet bot commands

Besides the app, [@BitcoinDeepaBot](https://t.me/BitcoinDeepaBot) works as a chat wallet. You type commands to check your balance and to send or receive sats with other Telegram users, in a private chat with the bot or in a group.

Transfers you make this way appear in the app's [Activity](activity.md) tab as **Sent** and **Received**.

{% hint style="info" %}
Type commands in the chat with the bot. The **Menu** button next to the message box lists the commands, so you don't have to remember them.
{% endhint %}

## Everyday commands

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `/start`               | Sets up your wallet and shows the basic commands.         |
| `/balance`             | Shows your wallet balance.                                |
| `/invoice <amount>`    | Creates an invoice that someone can pay to send you sats. |
| `/send <amount> @user` | Sends sats to another Bitcoin Deepa user.                 |
| `/tip <amount> [memo]` | Tips the person whose message you are replying to.        |
| `/transactions`        | Lists your past transactions.                             |
| `/advanced`            | Lists the advanced commands.                              |

Amounts are in sats.

### Receive sats

1. Send `/invoice 1000` to create an invoice for 1,000 sats.
2. Share the invoice with the person paying you.
3. When it is paid, the sats are added to your balance.

### Send sats

Send `/send 500 @username` to send 500 sats. You can add a short message after the username.

The other person needs a Bitcoin Deepa wallet, which they get by sending `/start` to the bot.

### Tip in a group

Reply to someone's message with `/tip 100` to tip them 100 sats. Add a note if you like: `/tip 100 Thanks for the help`.

## Group commands

| Command                         | What it does                                                             |
| ------------------------------- | ------------------------------------------------------------------------ |
| `/faucet <capacity> <per_user>` | Gives away sats in a group. Members claim a share until it runs out.     |
| `/tipjar <capacity> <per_user>` | Collects sats in a group. Members tap a button to pay in a fixed amount. |

**Faucet example:** `/faucet 1000 100` shares 1,000 sats, 100 at a time, so the first 10 people who claim each get 100 sats.

**Tip jar example:** `/tipjar 1000 100` collects up to 1,000 sats, with each member paying in 100.

## Connect another wallet app

`/link` creates a QR code that connects your Bitcoin Deepa wallet to a separate Lightning wallet app, such as Zeus or BlueWallet.

{% hint style="warning" %}
Treat the QR code from `/link` like a password. Anyone who scans it can use your wallet. The code stays on screen only briefly, so never share it or a screenshot of it.
{% endhint %}
