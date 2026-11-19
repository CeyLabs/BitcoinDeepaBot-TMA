# Activity

The **Activity** tab is your full history: every plan payment, one-time buy and transfer, newest first and grouped by day.

<!-- screenshot: the Activity tab with one row expanded -->

## Find something

- **Search**: type a name or a word, such as a plan name or a Telegram username.
- **Tabs**: narrow the list to one kind of activity.
- **Eye icon**: hide or show the amounts.
- **Load more**: at the bottom of the list, loads older activity.

| Tab                | Shows                                                              |
| ------------------ | ------------------------------------------------------------------ |
| **All Activities** | Everything.                                                        |
| **Transactions**   | One-time buys, and sats you sent to or received from other people. |
| **Tasks**          | **Coming soon.**                                                   |
| **Plans**          | Your plan payments.                                                |

## Kinds of activity

| Entry                 | What it is                                                                        |
| --------------------- | --------------------------------------------------------------------------------- |
| **Membership Reward** | A plan payment and the bitcoin it bought. The plan's name is shown underneath.    |
| **Bitcoin Purchase**  | A [one-time buy](buy-bitcoin.md).                                                 |
| **Sent**              | Sats you sent to another Telegram user through the [wallet bot](bot-commands.md). |
| **Received**          | Sats another Telegram user sent you.                                              |

Each row shows the amount in sats and its approximate value in rupees. Incoming amounts are green with a `+`, outgoing amounts are red with a `-`.

## See the details

Tap a row to expand it:

- **Status** and **Date**.
- **BTC price at transaction time**, for purchases.
- **Memo**, if the sender added one to a transfer.
- **Transaction ID**, with a button to copy it. Quote this ID if you contact support.

## What the status means

A coloured dot next to each entry shows its status at a glance.

| Status         | Dot    | Meaning                                                      |
| -------------- | ------ | ------------------------------------------------------------ |
| **Settled**    | Green  | Paid, and the bitcoin is in your wallet.                     |
| **Completed**  | Green  | A transfer that went through.                                |
| **Processing** | Orange | Paid. The bitcoin is on its way to your wallet.              |
| **Pending**    | Orange | The payment has not been confirmed yet.                      |
| **Cancelled**  | Grey   | The payment was cancelled. Nothing was added to your wallet. |
| **Failed**     | Red    | The payment or transfer did not go through.                  |
| **Chargeback** | Red    | The payment was reversed by your bank.                       |

When a payment was cancelled, failed or reversed, its sats amount is shown crossed out, because that bitcoin was never added to your wallet.

## If part of the list doesn't load

Your purchases and your transfers are loaded separately. If one of them fails, the app still shows the other and tells you which part is missing. Tap **Try again**.
