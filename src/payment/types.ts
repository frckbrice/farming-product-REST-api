/**
 * Shared payment types and normalized results for provider-agnostic payment handling.
 * Allows the API to support multiple payment providers (ADWA, Stripe, external, etc.)
 * while keeping a single contract for controllers and routes.
 */

export type PaymentMethodCode =
  | "MOBILE-MONEY"
  | "ORANGE-MONEY"
  | "VISA"
  | "MASTERCARD"
  | string;

export interface PaymentRequestPayload {
  meanCode: PaymentMethodCode;
  amount: string;
  currency: string;
  orderNumber?: string;
  paymentNumber?: string;
  feesAmount?: number;
}

/** Normalized result from any provider: initiate payment */
export interface InitiatePaymentResult {
  success: boolean;
  /** Provider-specific reference (e.g. adpFootprint) for status checks or webhooks */
  footprint?: string;
  /** Redirect URL for card/3DS (e.g. CARD_PAY_LINK) */
  redirectUrl?: string;
  /** Raw status from provider (e.g. "T" = success, "E" = pending) */
  status?: string;
  /** Full raw response for storage in txDetails or client display */
  raw?: Record<string, unknown>;
}

/** Normalized result from any provider: check status */
export interface PaymentStatusResult {
  success: boolean;
  status: string;
  raw?: Record<string, unknown>;
}

/** Provider identifier; used by factory and optional per-tenant config */
export type PaymentProviderId = "adwa" | "stripe" | "external";
