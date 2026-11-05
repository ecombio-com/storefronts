export const formatPrice = (amount: string, currency: string) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency}).format(Number(amount));