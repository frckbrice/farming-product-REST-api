import type { IPaymentProvider } from "../IPaymentProvider";
import type { PaymentProviderId } from "../types";
import { AdwaPaymentProvider } from "./AdwaPaymentProvider";

const defaultProvider: IPaymentProvider = new AdwaPaymentProvider();
const providers: Record<PaymentProviderId, IPaymentProvider | null> = {
  adwa: defaultProvider,
  stripe: null,
  external: null,
};

/**
 * Returns the payment provider for the given id.
 * Use PAYMENT_PROVIDER env (e.g. "adwa") for default; later can be per-tenant.
 * API consumers can pass ?provider=adwa or use external flow for their own provider.
 */
export function getPaymentProvider(
  providerId?: PaymentProviderId | string | null,
): IPaymentProvider {
  const id = (providerId ??
    process.env.PAYMENT_PROVIDER ??
    "adwa") as PaymentProviderId;
  const provider = providers[id];
  if (provider) {
    return provider;
  }
  // Fallback to ADWA when configured (current behaviour)
  return defaultProvider;
}

export { AdwaPaymentProvider };
