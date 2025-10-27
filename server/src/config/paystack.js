const https = require('https');

/**
 * Initialize Paystack payment
 * @param {string} email - User email
 * @param {number} amount - Amount in kobo (NGN * 100)
 * @param {string} reference - Payment reference
 * @param {Object} metadata - Additional payment data
 * @returns {Promise<Object>}
 */
const initializePayment = async (email, amount, reference, metadata = {}) => {
  const params = JSON.stringify({
    email,
    amount,
    reference,
    metadata,
    callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(params);
    req.end();
  });
};

/**
 * Verify Paystack payment
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>}
 */
const verifyPayment = async (reference) => {
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

module.exports = {
  initializePayment,
  verifyPayment,
};