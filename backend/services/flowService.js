const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();


class FlowService {
    constructor() {
        this.apiKey = process.env.FLOW_API_KEY;
        this.secretKey = process.env.FLOW_SECRET_KEY;
        this.baseURL = process.env.FLOW_ENV === 'production'
            ? 'https://www.flow.cl/api'
            : 'https://sandbox.flow.cl/api';

        console.log('🔧 Flow Service inicializado:', {
            hasApiKey: !!this.apiKey,
            hasSecretKey: !!this.secretKey,
            apiKeyStart: this.apiKey?.substring(0, 10) + '***',
            baseURL: this.baseURL
        });
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

        console.log('🔐 String a firmar:', dataToSign);
        console.log('🔐 Keys incluidas:', sortedKeys);

        return crypto.createHmac('sha256', this.secretKey).update(dataToSign).digest('hex');
    }

    async createPayment(paymentData) {
        console.log('\n🚀 === INICIO createPayment ===');
        console.log('📦 Datos recibidos:', JSON.stringify(paymentData, null, 2));

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

        console.log('📤 Parámetros finales:', params);

        try {
            console.log('🌐 POST to:', `${this.baseURL}/payment/create`);

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

            // ✅ FIX #4: Validar que Flow retornó una respuesta válida con token y url
            // Flow puede retornar error con HTTP 200 en sandbox (code != 0)
            if (!data || !data.token || !data.url) {
                console.error('❌ Flow respuesta inválida o sin token:', data);
                throw new Error(
                    `Flow no retornó token/url. Código: ${data?.code}, Mensaje: ${data?.message || 'Sin mensaje'}`
                );
            }

            console.log('✅ Flow response SUCCESS:', data);
            return data;

        } catch (error) {
            // Si el error ya lo lanzamos nosotros arriba, lo re-lanzamos tal cual
            if (!error.response) {
                throw error;
            }
            console.error('❌ Flow ERROR:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                errorMessage: error.response?.data?.message,
                errorCode: error.response?.data?.code,
                fullError: error.response?.data
            });
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
            console.log('🔐 Validando callback de Flow:', params);

            const { s: receivedSignature, ...dataToSign } = params;

            if (!receivedSignature) {
                console.log('❌ No hay firma en el callback');
                return false;
            }

            console.log('📦 Datos a firmar:', dataToSign);
            console.log('📝 Firma recibida:', receivedSignature);

            const expectedSignature = this.sign(dataToSign);
            console.log('📝 Firma esperada:', expectedSignature);

            const isValid = receivedSignature === expectedSignature;
            console.log(isValid ? '✅ Firma válida' : '❌ Firma inválida');

            return isValid;

        } catch (error) {
            console.error('❌ Error validando firma:', error);
            return false;
        }
    }
}


module.exports = new FlowService();
