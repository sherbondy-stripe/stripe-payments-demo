/**
 * routes.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet).
 *
 * This file defines all the endpoints for this demo app. The two most interesting
 * endpoints for a Stripe integration are marked as such at the beginning of the file.
 * It's all you need in your app to accept all payments in your app.
 */

'use strict';

const config = require('./config');
const setup = require('./setup');
const {orders, products} = require('./inventory');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);

// Render the main app HTML.
router.get('/', (req, res) => {
  res.render('index.html');
});

router.get('/newcheckout', (req, res) => {
  res.render('checkout.html');
});


class FpxBank {
  constructor({id, name, displayNames, normalizeName, testOnly, status}) {
    this.id = id;
    this.name=name;
    this.displayNames = displayNames;
    this.normalizeName = normalizeName;
    this.testOnly = testOnly;
    this.status = status;
  }
}

// set some of the banks as offline for now
const banks = [
    new FpxBank({id: "ABB0234", name: "Affin Bank Berhad B2C - Test ID", displayNames: {B2C: "Affin B2C - Test ID"}, normalizeName: "affin_bank_test", is_testing_only: true}),
    new FpxBank({id: "ABB0233", name: "Affin Bank Berhad", displayNames: {B2C:  "Affin Bank"}, normalizeName: "affin_bank"}),
    new FpxBank({id: "ABMB0212", name: "Alliance Bank Malaysia Berhad", displayNames: {B2C:  "Alliance Bank (Personal)"}, normalizeName: "alliance_bank"}),
    new FpxBank({id: "AMBB0209", name: "AmBank Malaysia Berhad", displayNames: {B2C:  "AmBank"}, normalizeName: "ambank"}),
    new FpxBank({id: "BIMB0340", name: "Bank Islam Malaysia Berhad", displayNames: {B2C:  "Bank Islam", B2B1: "Bank Islam"}, normalizeName: "bank_islam"}),
    new FpxBank({id: "BMMB0341", name: "Bank Muamalat Malaysia Berhad", displayNames: {B2C:  "Bank Muamalat"}, normalizeName: "bank_muamalat", status: 'offline'}),
    new FpxBank({id: "BKRM0602", name: "Bank Kerjasama Rakyat Malaysia Berhad", displayNames: {B2C:  "Bank Rakyat", B2B1: "i-bizRAKYAT"}, normalizeName: "bank_rakyat"}),
    new FpxBank({id: "BSN0601", name: "Bank Simpanan Nasional", displayNames: {B2C:  "BSN"}, normalizeName: "bsn"}),
    new FpxBank({id: "BCBB0235", name: "CIMB Bank Berhad", displayNames: {B2C:  "CIMB Clicks", B2B1: "CIMB Bank"}, normalizeName: "cimb"}),
    new FpxBank({id: "HLB0224", name: "Hong Leong Bank Berhad", displayNames: {B2C:  "Hong Leong Bank", B2B1: "Hong Leong Bank"}, normalizeName: "hong_leong_bank"}),
    new FpxBank({id: "HSBC0223", name: "HSBC Bank Malaysia Berhad", displayNames: {B2C:  "HSBC Bank", B2B1: "HSBC Bank"}, normalizeName: "hsbc"}),
    new FpxBank({id: "KFH0346", name: "Kuwait Finance House (Malaysia) Berhad", displayNames: {B2C:  "KFH", B2B1: "KFH"}, normalizeName: "kfh"}),
    new FpxBank({id: "MB2U0227", name: "Malayan Banking Berhad (M2U)", displayNames: {B2C:  "Maybank2U"}, normalizeName: "maybank2u"}),
    new FpxBank({id: "OCBC0229", name: "OCBC Bank Malaysia Berhad", displayNames: {B2C:  "OCBC Bank", B2B1: "OCBC Bank"}, normalizeName: "ocbc"}),
    new FpxBank({id: "PBB0233", name: "Public Bank Berhad", displayNames: {B2C:  "Public Bank", B2B1: "Public Bank"}, normalizeName: "public_bank"}),
    new FpxBank({id: "RHB0218", name: "RHB Bank Berhad", displayNames: {B2C:  "RHB Bank", B2B1: "RHB Bank"}, normalizeName: "rhb"}),
    new FpxBank({id: "TEST0021", name: "SBI Bank A", displayNames: {B2C:  "SBI Bank A", B2B1: "SBI Bank A"}, normalizeName: "sbi_bank_a", is_testing_only: true}),
    new FpxBank({id: "TEST0022", name: "SBI Bank B", displayNames: {B2C:  "SBI Bank B", B2B1: "SBI Bank B"}, normalizeName: "sbi_bank_b", is_testing_only: true}),
    new FpxBank({id: "TEST0023", name: "SBI Bank C", displayNames: {B2C:  "SBI Bank C", B2B1: "SBI Bank C"}, normalizeName: "sbi_bank_c", is_testing_only: true}),
    new FpxBank({id: "SCB0216", name: "Standard Chartered Bank", displayNames: {B2C:  "Standard Chartered"}, normalizeName: "standard_chartered", status: 'offline'}),
    new FpxBank({id: "UOB0226", name: "United Overseas Bank", displayNames: {B2C:  "UOB Bank"}, normalizeName: "uob"}),
    new FpxBank({id: "UOB0229", name: "United Overseas Bank - B2C Test", displayNames: {B2C:  "UOB Bank - Test ID"}, normalizeName: "uob_test", is_testing_only: true}),
    new FpxBank({id: "ABB0232", name: "Affin Bank Berhad", displayNames: {B2B1:  "Affin Bank"}, normalizeName: "affin_bank"}),
    new FpxBank({id: "ABMB0213", name: "Alliance Bank Malaysia Berhad", displayNames: {B2B1:  "Alliance Bank (Business)"}, normalizeName: "alliance_bank"}),
    new FpxBank({id: "AMBB0208", name: "AmBank Malaysia Berhad", displayNames: {B2B1:  "AmBank"}, normalizeName: "ambank"}),
    new FpxBank({id: "BMMB0342", name: "Bank Muamalat Malaysia Berhad", displayNames: {B2B1:  "Bank Muamalat"}, normalizeName: "bank_muamalat", status: 'offline'}),
    new FpxBank({id: "DBB0199", name: "Deutsche Bank Berhad", displayNames: {B2B1:  "Deutsche Bank"}, normalizeName: "deutsche_bank"}),
    new FpxBank({id: "MBB0228", name: "Malayan Banking Berhad (M2E)", displayNames: {B2B1:  "Maybank2E"}, normalizeName: "maybank2e"}),
    new FpxBank({id: "PBB0234", name: "Public Bank Enterprise", displayNames: {B2B1:  "PB Enterprise"}, normalizeName: "pb_enterprise"}),
    new FpxBank({id: "SCB0215", name: "Standard Chartered Bank", displayNames: {B2B1:  "Standard Chartered"}, normalizeName: "standard_chartered"}),
    new FpxBank({id: "UOB0227", name: "United Overseas Bank", displayNames: {B2B1:  "UOB Bank"}, normalizeName: "uob"}),
    new FpxBank({id: "UOB0228", name: "United Overseas Bank B2B Regional", displayNames: {B2B1:  "UOB Regional"}, normalizeName: "uob_regional", status: 'offline'}),

];


router.get('/fpx', (req, res) => {
  res.render('fpx.html');
});

router.get('/fpx/auth', (req, res) => {
  res.render('fpxauth.html');
});

// Step 1: create payment_intent
router.post('/fpx/pi', async (req, res) => {
  const options = req.body || {};

  try {
    let pi = await stripe.paymentIntents.create({
      amount: options.amount || 10,
      currency: options.currency || 'myr',
      payment_method_types: ['fpx'],
    });
    res.status(200).json({pi});
  } catch(err) {
    res.status(401).json({
      err: `${err}`,
    });
  }
});

router.get('/fpx/pi/:id', async (req, res) => {
  try {
    const pi = await stripe.paymentIntents.retrieve(req.params.id);
    const charge = pi.charges.data[0];
    const lastPaymentErr = pi.last_payment_error;

    const pm = await stripe.paymentMethods.retrieve(pi.payment_method)
    
    let fpxTxnDetails = charge ? {
      txnDt: charge.created,
      amount: charge.amount / 100,
      sellerOrderNum: charge.statement_descriptor || "85243809", // WIP
      txnId: charge.payment_method_details.fpx_transaction_id || "54696286707430", // WIP
      buyerBank: charge.payment_method_details.fpx.bank,
      txnStatus: charge.status,
      account_holder_type: pm.fpx.account_holder_type,
    } : {
      txnDt: lastPaymentErr.payment_method.created,
      amount: pi.amount / 100,
      sellerOrderNum: 'NA', // WIP
      txnId: 'NA', // WIP
      buyerBank: lastPaymentErr.payment_method.fpx.bank, // WIP 
      txnStatus: 'failed',
      account_holder_type: 'NA',
      error: lastPaymentErr.message,
      code: lastPaymentErr.code,
    };

    res.status(200).json({
      fpxTxnDetails,
      lastPaymentErr,
      charge,
    });
  } catch(err) {
    res.status(401).json({
      err: `${err}`,
    });
  }
});

// This will create FPX payment method
// Using Manual Confirmation route.
router.post('/fpx/pm', async (req, res) => {
  const {
    bank, 
    amount=100, 
    currency='myr',
    returnUrl='http://localhost:8000/fpx?success',
  } = req.body;
  
  // Bank should be normalized_name for bank
  const tokens = bank.split(':')
  const bank_id = tokens[0]
  const business_model = tokens[1]
  const {normalizeName: bankName} = banks.find(b => b.id === bank_id);

  try {
    // 1. Create payment_intent
    let pi = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['fpx'],
    });

    // 2. Creating the payment method
    const account_holder_type = business_model == 'B2C' ? 'individual' : 'company';
    let pm = await stripe.paymentMethods.create({
      type: 'fpx',
      fpx: {
        bank: bankName,
        account_holder_type: account_holder_type
      }
    });

    // 3. Confirm PaymentIntent
    pi = await stripe.paymentIntents.confirm(pi.id, {
      payment_method: pm.id,
      return_url: returnUrl,
    });

    res.status(200).json({
      pm,
      pi,
    });
  } catch (err) {
    res.status(401).json({
      err: `${err}`,
    });
  }
});

router.get('/fpx/banks', (req, res) => {
  banks.sort((a, b) => {
    var nameA = (a.displayNames.B2C || a.displayNames.B2B1).toUpperCase(); // ignore upper and lowercase
    var nameB = (b.displayNames.B2C || b.displayNames.B2B1).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
  
    // names must be equal
    return 0;
  })
  res.status(200).json(banks);
});


/**
 * Stripe integration to accept all types of payments with 3 POST endpoints.
 *
 * 1. POST endpoint to create orders with all user information.
 * 2. POST endpoint to complete a payment immediately when a card is used.
 * For payments using Elements, Payment Request, Apple Pay, Google Pay, Microsoft Pay.
 * 3. POST endpoint to be set as a webhook endpoint on your Stripe account.
 * It creates a charge as soon as a non-card payment source becomes chargeable.
 */

// Create an order on the backend.
router.post('/orders', async (req, res, next) => {
  let {currency, items, email, shipping, createIntent} = req.body;
  try {
    let order = await orders.create(currency, items, email, shipping, createIntent);
    return res.status(200).json({order});
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
});

// Complete payment for an order using a source.
router.post('/orders/:id/pay', async (req, res, next) => {
  let {source} = req.body;
  try {
    // Retrieve the order associated to the ID.
    let order = await orders.retrieve(req.params.id);
    // Verify that this order actually needs to be paid.
    if (
      order.metadata.status === 'pending' ||
      order.metadata.status === 'paid'
    ) {
      return res.status(403).json({order, source});
    }
    // Pay the order using the Stripe source.
    if (source && source.status === 'chargeable') {
      let charge, status;
      try {
        charge = await stripe.charges.create(
          {
            source: source.id,
            amount: order.amount,
            currency: order.currency,
            receipt_email: order.email,
          },
          {
            // Set a unique idempotency key based on the order ID.
            // This is to avoid any race conditions with your webhook handler.
            idempotency_key: order.id,
          }
        );
      } catch (err) {
        // This is where you handle declines and errors.
        // For the demo we simply set to failed.
        status = 'failed';
      }
      if (charge && charge.status === 'succeeded') {
        status = 'paid';
      } else if (charge) {
        status = charge.status;
      } else {
        status = 'failed';
      }
      // Update the order with the charge status.
      order = await orders.update(order.id, {metadata: {status}});
    }
    return res.status(200).json({order, source});
  } catch (err) {
    return res.status(500).json({error: err.message});
  }
});

// Webhook handler to process payments for sources asynchronously.
router.post('/webhook', async (req, res) => {
  let data;
  let eventType;
  // Check if webhook signing is configured.
  if (config.stripe.webhookSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    let signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = req.body.data;
    eventType = req.body.type;
  }
  const object = data.object;

  // PaymentIntent Beta, see https://stripe.com/docs/payments/payment-intents 
  // Monitor payment_intent.succeeded & payment_intent.payment_failed events.
  if (
    object.object === 'payment_intent' &&
    object.metadata.order
  ) {
    const paymentIntent = object;
    // Find the corresponding order this source is for by looking in its metadata.
    const order = await orders.retrieve(paymentIntent.metadata.order);
    if (eventType === 'payment_intent.succeeded') {
      console.log(`🔔  Webhook received! Payment for PaymentIntent ${paymentIntent.id} succeeded.`);
      // Update the order status to mark it as paid.
      await orders.update(order.id, {metadata: {status: 'paid'}});
    } else if (eventType === 'payment_intent.payment_failed') {
      console.log(`🔔  Webhook received! Payment on source ${paymentIntent.last_payment_error.source.id} for PaymentIntent ${paymentIntent.id} failed.`);
      // Note: you can use the existing PaymentIntent to prompt your customer to try again by attaching a newly created source:
      // https://stripe.com/docs/payments/payment-intents#lifecycle
    }
  }

  // Monitor `source.chargeable` events.
  if (
    object.object === 'source' &&
    object.status === 'chargeable' &&
    object.metadata.order
  ) {
    const source = object;
    console.log(`🔔  Webhook received! The source ${source.id} is chargeable.`);
    // Find the corresponding order this source is for by looking in its metadata.
    const order = await orders.retrieve(source.metadata.order);
    // Verify that this order actually needs to be paid.
    if (
      order.metadata.status === 'pending' ||
      order.metadata.status === 'paid' ||
      order.metadata.status === 'failed'
    ) {
      return res.sendStatus(403);
    }

    // Note: We're setting an idempotency key below on the charge creation to
    // prevent any race conditions. It's set to the order ID, which protects us from
    // 2 different sources becoming `chargeable` simultaneously for the same order ID.
    // Depending on your use cases and your idempotency keys, you might need an extra
    // lock surrounding your webhook code to prevent other race conditions.
    // Read more on Stripe's best practices here for asynchronous charge creation:
    // https://stripe.com/docs/sources/best-practices#charge-creation

    // Pay the order using the source we just received.
    let charge, status;
    try {
      charge = await stripe.charges.create(
        {
          source: source.id,
          amount: order.amount,
          currency: order.currency,
          receipt_email: order.email,
        },
        {
          // Set a unique idempotency key based on the order ID.
          // This is to avoid any race conditions with your webhook handler.
          idempotency_key: order.id,
        }
      );
    } catch (err) {
      // This is where you handle declines and errors.
      // For the demo, we simply set the status to mark the order as failed.
      status = 'failed';
    }
    if (charge && charge.status === 'succeeded') {
      status = 'paid';
    } else if (charge) {
      status = charge.status;
    } else {
      status = 'failed';
    }
    // Update the order status based on the charge status.
    await orders.update(order.id, {metadata: {status}});
  }

  // Monitor `charge.succeeded` events.
  if (
    object.object === 'charge' &&
    object.status === 'succeeded' &&
    object.source.metadata.order
  ) {
    const charge = object;
    console.log(`🔔  Webhook received! The charge ${charge.id} succeeded.`);
    // Find the corresponding order this source is for by looking in its metadata.
    const order = await orders.retrieve(charge.source.metadata.order);
    // Update the order status to mark it as paid.
    await orders.update(order.id, {metadata: {status: 'paid'}});
  }

  // Monitor `source.failed`, `source.canceled`, and `charge.failed` events.
  if (
    (object.object === 'source' || object.object === 'charge') &&
    (object.status === 'failed' || object.status === 'canceled')
  ) {
    const source = object.source ? object.source : object;
    console.log(`🔔  Webhook received! Failure for ${object.id}.`);
    if (source.metadata.order) {
      // Find the corresponding order this source is for by looking in its metadata.
      const order = await orders.retrieve(source.metadata.order);
      // Update the order status to mark it as failed.
      await orders.update(order.id, {metadata: {status: 'failed'}});
    }
  }

  // Return a 200 success code to Stripe.
  res.sendStatus(200);
});

/**
 * Routes exposing the config as well as the ability to retrieve products and orders.
 */

// Expose the Stripe publishable key and other pieces of config via an endpoint.
router.get('/config', (req, res) => {
  res.json({
    stripePublishableKey: config.stripe.publishableKey,
    stripeCountry: config.stripe.country,
    country: config.country,
    currency: config.currency,
  });
});

// Retrieve an order.
router.get('/orders/:id', async (req, res) => {
  try {
    return res.status(200).json(await orders.retrieve(req.params.id));
  } catch (err) {
    return res.sendStatus(404);
  }
});

// Retrieve all products.
router.get('/products', async (req, res) => {
  const productList = await products.list();
  // Check if products exist on Stripe Account.
  if (products.exist(productList)) {
    res.json(productList);
  } else {
    // We need to set up the products.
    await setup.run();
    res.json(await products.list());
  }
});

// Retrieve a product by ID.
router.get('/products/:id', async (req, res) => {
  res.json(await products.retrieve(req.params.id));
});

module.exports = router;
