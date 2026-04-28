'use strict';

const { Resend } = require('resend');
const { supabaseAdmin } = require('../config/supabase');
const { getCurrentPrices } = require('./coinGecko');
const env = require('../config/env');
const logger = require('../utils/logger');

const resend = new Resend(env.resendApiKey);

/**
 * Checks all active price alerts and sends email notifications
 * when a target price condition is met.
 */
async function checkAlerts() {
  // 1. Fetch all active alerts via supabaseAdmin (bypasses RLS)
  const { data: alerts, error: alertsError } = await supabaseAdmin
    .from('price_alerts')
    .select('id, user_id, coin_symbol, target_price, direction')
    .eq('active', true);

  if (alertsError) {
    logger.error(`[AlertChecker] Failed to fetch alerts: ${alertsError.message}`);
    return;
  }

  if (!alerts || alerts.length === 0) {
    logger.debug('[AlertChecker] No active alerts found');
    return;
  }

  // 2. Get unique symbols and fetch current prices
  const symbols = [...new Set(alerts.map((a) => a.coin_symbol.toUpperCase()))];
  const prices = await getCurrentPrices(symbols);

  if (Object.keys(prices).length === 0) {
    logger.warn('[AlertChecker] Could not fetch any current prices, skipping check');
    return;
  }

  // 3. Determine which alerts are triggered
  const triggeredIds = [];
  const triggeredAlerts = [];

  for (const alert of alerts) {
    const symbol = alert.coin_symbol.toUpperCase();
    const priceData = prices[symbol];
    if (!priceData || priceData.usd === null) continue;

    const currentPrice = priceData.usd;
    const targetPrice = parseFloat(alert.target_price);

    const isTriggered =
      (alert.direction === 'ABOVE' && currentPrice >= targetPrice) ||
      (alert.direction === 'BELOW' && currentPrice <= targetPrice);

    if (isTriggered) {
      triggeredIds.push(alert.id);
      triggeredAlerts.push({ ...alert, currentPrice });
    }
  }

  if (triggeredIds.length === 0) {
    logger.debug(`[AlertChecker] Checked ${alerts.length} alerts, none triggered`);
    return;
  }

  // 4. For each triggered alert, fetch user email and send notification
  for (const alert of triggeredAlerts) {
    try {
      // Fetch user email from auth.users via admin client
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
        alert.user_id
      );

      if (userError || !userData?.user?.email) {
        logger.warn(
          `[AlertChecker] Could not fetch email for user ${alert.user_id}: ${userError?.message}`
        );
        continue;
      }

      const userEmail = userData.user.email;
      const symbol = alert.coin_symbol.toUpperCase();
      const price = alert.currentPrice;
      const formattedPrice = price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: userEmail,
        subject: `Alerta: ${symbol} atingiu $${formattedPrice}`,
        html: `<p>Seu alerta de preço foi acionado: <strong>${symbol}</strong> está em <strong>$${formattedPrice}</strong></p>`,
      });

      logger.info(
        `[AlertChecker] Email sent to ${userEmail} — ${symbol} at $${formattedPrice} (direction: ${alert.direction}, target: $${alert.target_price})`
      );
    } catch (emailErr) {
      logger.error(
        `[AlertChecker] Failed to send email for alert ${alert.id}: ${emailErr.message}`
      );
    }
  }

  // 5. Mark triggered alerts as inactive
  const { error: updateError } = await supabaseAdmin
    .from('price_alerts')
    .update({ active: false, triggered_at: new Date().toISOString() })
    .in('id', triggeredIds);

  if (updateError) {
    logger.error(`[AlertChecker] Failed to update triggered alerts: ${updateError.message}`);
  }

  logger.info(
    `[AlertChecker] ${triggeredIds.length} alert(s) triggered out of ${alerts.length} checked`
  );
}

module.exports = { checkAlerts };
