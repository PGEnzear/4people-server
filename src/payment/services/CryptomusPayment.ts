import { injectable } from "inversify";

import config from "../../config";

@injectable()
export class CryptomusPayment {

    private readonly apiKey: string;
    private readonly merchantId: string;
  
    public constructor() {
        this.apiKey = config.PAYMENT.CRYPTOMUS.CRYPTOMUS_API_KEY
        this.merchantId = config.PAYMENT.CRYPTOMUS.CRYPTOMUS_MERCHANT_ID
    }

}