/*
  防御验证 v2 —— 双权益 ID 注入（对应二进制中的两个 ID）
[rewrite_local]
^https?:\/\/api\.revenuecat\.com\/v1\/(subscribers\/[^\/]+$|receipts$) url script-response-body https://your-gist/MOZE-test-v2.js
[MITM]
hostname = api.revenuecat.com
*/

var body = JSON.parse($response.body);
var subscriber = body.subscriber || {};

function makeEntitlement(pid) {
  return {
    "expires_date": "6666-06-06T06:06:06Z",
    "product_identifier": pid,
    "purchase_date": "2023-02-23T02:33:33Z",
    "ownership_type": "PURCHASED",
    "store": "app_store"
  };
}

// 两个 ID 都注入：覆盖 MOZE_PREMIUM_SUBSCRIPTION 与 PRO_SUBSCRIPTION
var entitlements = Object.assign({}, subscriber.entitlements, {
  "MOZE_PREMIUM_SUBSCRIPTION": makeEntitlement("MOZE_PRO_SUBSCRIPTION_YEARLY_BASIC"),
  "PRO_SUBSCRIPTION": makeEntitlement("MOZE_PRO_SUBSCRIPTION_YEARLY_BASIC")
});
subscriber.entitlements = entitlements;
subscriber.subscriptions = Object.assign({}, subscriber.subscriptions, {
  "MOZE_PRO_SUBSCRIPTION_YEARLY_BASIC": Object.assign({}, makeEntitlement("MOZE_PRO_SUBSCRIPTION_YEARLY_BASIC"), {
    "original_purchase_date": "2023-02-23T02:33:33Z"
  })
});
subscriber.original_purchase_date = "2023-02-23T03:33:33Z";
body.subscriber = subscriber;
$done({ body: JSON.stringify(body) });
