import axios, { AxiosError } from "axios";
import { AppError } from "../../errors";
import type { IPaymentProvider } from "../IPaymentProvider";
import type {
  PaymentRequestPayload,
  InitiatePaymentResult,
  PaymentStatusResult,
} from "../types";

const MERCHANT_KEY = process.env.ADWA_MERCHANT_KEY;
const APPLICATION_KEY = process.env.ADWA_APPLICATION_KEY;
const SUBSCRIPTION_KEY = process.env.ADWA_SUBSCRIPTION_KEY;
const BaseURL_Adwa = process.env.ADWA_BASE_URL;

interface AdwaTokenResponse {
  data?: { tokenCode?: string };
}

interface AdwaDataResponse {
  data?: {
    tokenCode?: string;
    adpFootprint?: string;
    status?: string;
    CARD_PAY_LINK?: string;
    [k: string]: unknown;
  };
}

export class AdwaPaymentProvider implements IPaymentProvider {
  readonly id = "adwa";

  private async getAuthToken(): Promise<string> {
    if (
      !MERCHANT_KEY ||
      !APPLICATION_KEY ||
      !SUBSCRIPTION_KEY ||
      !BaseURL_Adwa
    ) {
      throw new Error("Missing required Adwa payment configuration");
    }
    try {
      const data = JSON.stringify({ application: APPLICATION_KEY });
      const config = {
        method: "post" as const,
        url: `${BaseURL_Adwa}/getADPToken`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(MERCHANT_KEY + ":" + SUBSCRIPTION_KEY).toString("base64")}`,
        },
        data,
      };
      const response = await axios(config);
      const body = response.data as AdwaTokenResponse;
      if (!body?.data?.tokenCode) {
        throw new AppError(
          "Failed to get auth token: no token in response",
          500,
        );
      }
      return body.data.tokenCode;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new AppError(
          `Failed to get auth token: ${(error.response.data as { message?: string })?.message || error.message}`,
          error.response.status,
        );
      }
      throw error instanceof AppError
        ? error
        : new AppError("Failed to get auth token", 500);
    }
  }

  async initiatePayment(
    payload: PaymentRequestPayload,
    orderId: string,
  ): Promise<InitiatePaymentResult> {
    const token = await this.getAuthToken();
    const orderNumber = payload.orderNumber ?? `order_${orderId}_${Date.now()}`;
    const data = {
      meanCode: payload.meanCode,
      amount: payload.amount,
      currency: payload.currency,
      orderNumber,
    };

    try {
      const config = {
        method: "post" as const,
        url: `${BaseURL_Adwa}/requestToPay`,
        headers: {
          "AUTH-API-TOKEN": `Bearer ${token}`,
          "AUTH-API-SUBSCRIPTION": SUBSCRIPTION_KEY!,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      };
      const response = await axios(config);
      const body = response.data as AdwaDataResponse;
      const d = body?.data ?? {};
      const status = d.status ?? "";
      const footprint = d.adpFootprint as string | undefined;
      const redirectUrl = d.CARD_PAY_LINK as string | undefined;

      return {
        success: true,
        footprint,
        redirectUrl,
        status,
        raw: d as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new AppError(
          `Payment request failed: ${(error.response.data as { message?: string })?.message || error.message}`,
          error.response.status,
        );
      }
      throw error instanceof AppError
        ? error
        : new AppError("Payment request failed", 500);
    }
  }

  async checkStatus(
    footprint: string,
    meanCode: string,
  ): Promise<PaymentStatusResult> {
    const token = await this.getAuthToken();
    try {
      const config = {
        method: "post" as const,
        url: `${BaseURL_Adwa}/paymentStatus`,
        headers: {
          "AUTH-API-TOKEN": `Bearer ${token}`,
          "AUTH-API-SUBSCRIPTION": SUBSCRIPTION_KEY!,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ adpFootprint: footprint, meanCode }),
      };
      const response = await axios(config);
      const body = response.data as AdwaDataResponse;
      const d = body?.data ?? {};
      const status = d.status ?? "";

      return {
        success: status === "T",
        status,
        raw: d as Record<string, unknown>,
      };
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new AppError(
          `Failed to check payment status: ${(error.response.data as { message?: string })?.message || error.message}`,
          error.response.status,
        );
      }
      throw error instanceof AppError
        ? error
        : new AppError("Failed to check payment status", 500);
    }
  }

  requiresPollingAfterInitiate(meanCode: string): boolean {
    return meanCode !== "MASTERCARD" && meanCode !== "VISA";
  }
}
