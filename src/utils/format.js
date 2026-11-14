export const formatPrice = (amount) => `Rs ${amount.toLocaleString('en-PK')}`;

export const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);
