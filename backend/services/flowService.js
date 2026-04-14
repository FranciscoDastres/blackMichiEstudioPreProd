import crypto from "crypto";
import axios from "axios";
import "dotenv/config";
import logger from "../lib/logger.js";

class FlowService {
    constructor() {
        this.apiKey = process.env.FLOW_API_KEY;
        this.secretKey = process.env.FLOW_SECRET_KEY;
        this.baseURL = process.env.FLOW_ENV === 'production'
            ? 'https://www.flow.cl/api'
            : 'https://sandbox.flow.cl/api';

        logger.info({ hasApiKey: !!this.apiKey, hasSecretKey: !!this.secretKey, baseURL: this.baseURL }, "Flow Service inicializado");
    }

    sign(params) {
        const cleanParams = {};
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                cleanParams[key] = params[key];
            }
        });

        const sortedKeys = Object.keys(cleanParams).sort();
        const dataToSign = sortedKeys.map(key => `${key}${cleanParams[key]}`).join('');

        logger.debug({ keys: sortedKeys }, "Flow: firmando request");

        return crypto.createHmac('sha256', this.secretKey).update(dataToSign).digest('hex');
    }

    async createPayment(paymentData) {
        logger.info({ commerceOrder: paymentData.commerceOrder, amount: paymentData.amount }, "Flow: creando pago");

        const params = {
            apiKey: this.apiKey,
            commerceOrder: paymentData.commerceOrder,
            subject: paymentData.subject,
            currency: 'CLP',
            amount: parseInt(paymentData.amount),
            email: paymentData.email,
            paymentMethod: 9,
            urlConfirmation: paymentData.urlConfirmation,
            urlReturn: paymentData.urlReturn
        };

        params.s = this.sign(params);

        logger.debug({ commerceOrder: params.commerceOrder }, "Flow: parámetros listos");

        try {
            logger.debug({ url: `${this.baseURL}/payment/create` }, "Flow: POST request");

            const formData = new URLSearchParams();
            Object.keys(params).forEach(key => {
                formData.append(key, params[key]);
            });

            const response = await axios.post(`${this.baseURL}/payment/create`, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;

            if (!data || !data.token || !data.url) {
                logger.error({ data }, "Flow: respuesta inválida o sin token");
                throw new Error(
                    `Flow no retornó token/url. Código: ${data?.code}, Mensaje: ${data?.message || 'Sin mensaje'}`
                );
            }

            logger.info({ flowOrder: data.flowOrder }, "Flow: pago creado exitosamente");
            return data;

        } catch (error) {
            if (!error.response) {
                throw error;
            }
            logger.error({
                status: error.response?.status,
                errorMessage: error.response?.data?.message,
                errorCode: error.response?.data?.code,
            }, "Flow: error en createPayment");
            throw new Error(`Error creando pago Flow: ${error.response?.data?.message || error.message}`);
        }
    }

    async getPaymentStatus(token) {
        const params = {
            apiKey: this.apiKey,
            token
        };

        params.s = this.sign(params);

        try {
            const response = await axios.get(`${this.baseURL}/payment/getStatus`, {
                params
            });

            return response.data;
        } catch (error) {
            throw new Error(`Error obteniendo estado Flow: ${error.response?.data?.message || error.message}`);
        }
    }

    validateCallback(params) {
        try {
            logger.debug("Flow: validando callback");

            const { s: receivedSignature, ...dataToSign } = params;

            if (!receivedSignature) {
                logger.warn("Flow: callback sin firma");
                return false;
            }

            logger.debug("Flow: verificando firma de callback");

            const expectedSignature = this.sign(dataToSign);
            const isValid = receivedSignature === expectedSignature;
            if (!isValid) logger.warn("Flow: firma inválida en callback");

            return isValid;

        } catch (error) {
            logger.error({ err: error }, "Flow: error validando firma");
            return false;
        }
    }
}

export default new FlowService();
