import type {
  PaymentRequestPayload,
  InitiatePaymentResult,
  PaymentStatusResult,
} from "./types";

/**
 * Payment provider interface.
 * Implementations: AdwaPaymentProvider (ADWA), and later Stripe, Flutterwave, or "external".
 * Allows API consumers to use a configured provider or to plug in their own via the "external" flow.
 */
export interface IPaymentProvider {
  readonly id: string;

  /**
   * Initiate a payment (request-to-pay / create payment intent).
   * For card flows, returns redirectUrl; for mobile money, client may poll or rely on webhook.
   */
  initiatePayment(
    payload: PaymentRequestPayload,
    orderId: string,
  ): Promise<InitiatePaymentResult>;

  /**
   * Check status of a payment (e.g. after async callback or polling).
   */
  checkStatus(
    footprint: string,
    meanCode: string,
  ): Promise<PaymentStatusResult>;

  /**
   * Whether this provider requires the platform to poll status (e.g. mobile money)
   * vs relying only on webhook (e.g. Stripe).
   */
  requiresPollingAfterInitiate?(meanCode: string): boolean;
}
