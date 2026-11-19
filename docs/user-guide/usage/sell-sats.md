# Sell sats

Selling turns sats from your wallet into rupees, paid into your bank account.

{% hint style="info" %}
Two things must be in place first: a [verified identity](../setup/verify-your-identity.md) and a [verified bank account](../setup/add-a-bank-account.md). If either is missing, the Sell screen tells you which and takes you there.
{% endhint %}

## Steps

1. On the **Wallet** tab, tap **Sell**.
2. Enter the **Amount (sats)**, or tap **Max** to sell as much as you can.
3. Check **You get (estimate)**, the fee, and the **Paid to** bank account.
4. Tap **Get quote**.
5. Review the quote and tap **Sell now**.
6. Confirm.

<!-- screenshot: the sell quote card with the countdown -->

## The quote

A quote fixes the price for a short time so you know exactly what you will receive.

| Row             | Meaning                                          |
| --------------- | ------------------------------------------------ |
| **You receive** | The rupees that will reach your bank account.    |
| **You sell**    | The sats leaving your wallet.                    |
| **Value**       | What those sats are worth before the fee.        |
| **Fee**         | The fee, as a percentage and in rupees.          |
| **Rate**        | The bitcoin price used for this sale.            |
| **Paid to**     | The bank and account number receiving the money. |

A countdown shows how long the price is locked. If it runs out, the quote expires and nothing is sold. Tap **Get a new quote** to continue, or **Change amount** to go back.

{% hint style="warning" %}
A sale cannot be undone once you confirm it. Check the amount and the bank account before you tap **Sell now**.
{% endhint %}

## After you confirm

The sale page updates by itself as the sale moves along:

| You see                      | What is happening                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| **Selling your sats**        | The sats are being taken from your wallet. This only takes a moment.                 |
| **Sending LKR to your bank** | Your sats are sold and the bank transfer is on its way.                              |
| **LKR sent**                 | Done. The rupees were sent to your bank account.                                     |
| **Returning your sats**      | The bank transfer could not be made, so your sats are being returned to your wallet. |
| **Sale cancelled**           | The bank transfer could not be made and your sats were returned.                     |
| **Quote expired**            | The quote ran out before the sale went through. Nothing was sold.                    |
| **We're checking this sale** | Something took longer than expected. The team is checking and will contact you.      |

The page also lists the amount, sats sold, fee, rate, date, a short **Reference**, and a **Bank reference** once the transfer is made. Quote the reference if you need to contact support.

If you see **We're checking this sale**, do not sell again until it is resolved.

## Recent sales

The Sell screen lists your last ten sales under **Recent sales**, each with a status:

| Badge          | Meaning                                    |
| -------------- | ------------------------------------------ |
| **Processing** | The sale is in progress.                   |
| **Paid**       | The rupees were sent to your bank.         |
| **Refunding**  | Your sats are being returned.              |
| **Refunded**   | Your sats were returned.                   |
| **Checking**   | The team is reviewing the sale.            |
| **Expired**    | The quote ran out before it was confirmed. |

Tap a sale to open its details.

## Limits

There is a minimum amount you can sell, and there may be a maximum per sale. If your amount is outside the limits, or more than your balance, the app tells you as soon as you tap **Get quote**.
