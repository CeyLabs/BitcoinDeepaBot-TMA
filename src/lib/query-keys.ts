export const queryKeys = {
  walletSummary: ["wallet-summary"] as const,
  // Scoped by user id so one account's cached history is never shown to
  // another account signed in on the same device.
  transactions: (userId: string) => ["transactions", userId] as const,
  botTransactions: (userId: string) => ["bot-transactions", userId] as const,
  packages: ["packages"] as const,
  userCount: ["user-count"] as const,
  subscriptionCurrent: ["subscription-current"] as const,
  kycStatus: ["kyc-status"] as const,
  userMe: ["user-me"] as const,
  banks: ["banks"] as const,
  bankAccounts: ["bank-accounts"] as const,
  sellPrice: ["sell", "price"] as const,
  sellOrders: ["sell", "orders"] as const,
  sellOrder: (id: string) => ["sell", "orders", id] as const,
  buyPrice: ["buy", "price"] as const,
  buyOrder: (id: string) => ["buy", "orders", id] as const,
  p2pMe: ["p2p", "me"] as const,
  p2pRecipient: (username: string) => ["p2p", "recipient", username] as const,
  usernameAvailability: (username: string) => ["user", "username", username] as const,
  p2pTransfer: (id: string) => ["p2p", "transfers", id] as const,
} as const;
