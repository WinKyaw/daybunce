import AIService from './AIService';

// TODO: Remove this flag before App Store submission.
// Set to true to bypass IAP checks during local development/testing.
const DEV_BYPASS_IAP = true;

function _getIAP() {
  // NitroModules (used by react-native-iap v12+) throw a native bridge error
  // before JS require() can catch it when New Architecture is not yet active.
  // This wrapper returns null gracefully so the app does not crash.
  try {
    return require('react-native-iap');
  } catch (e) {
    console.warn('IAPService: IAP module not available in this build.');
    return null;
  }
}

// react-native-iap v12 requires initConnection() before any store calls and
// endConnection() when done. This helper manages that lifecycle automatically.
async function _withConnection(iap, fn) {
  await iap.initConnection();
  try {
    return await fn();
  } finally {
    await iap.endConnection();
  }
}

// The App Store product ID for the one-time AI Expert unlock.
// This is a NON-CONSUMABLE product, which means:
//   - It is tied to the user's Apple ID, NOT the device.
//   - A purchase made on one device can be restored on any other device
//     signed in with the same Apple ID — StoreKit handles the verification.
//   - Different Apple IDs cannot share this purchase, making it personal
//     and non-transferable.
export const AI_PRODUCT_ID = 'com.daybunce.ai_expert_unlock';

const IAPService = {
  // Fast-path: read the local AsyncStorage flag first.
  // If not set (e.g. fresh device install), fall back to querying
  // the purchase history directly from the App Store.
  //
  // CROSS-DEVICE NOTE: On a brand-new device install, AsyncStorage is empty.
  // The user must tap "Restore Purchases" to re-verify their entitlement with
  // the App Store. After a successful restore, the flag is written to
  // AsyncStorage so subsequent launches are instant.
  async checkUnlockStatus() {
    // TODO: Remove DEV_BYPASS_IAP before release.
    if (DEV_BYPASS_IAP) {
      return true;
    }

    const localFlag = await AIService.isUnlocked();
    if (localFlag) {
      return true;
    }

    // Fall back to App Store history verification
    const iap = _getIAP();
    if (!iap) {
      return false;
    }
    try {
      return await _withConnection(iap, async () => {
        const history = await iap.getAvailablePurchases();
        if (history == null) {
          // Unexpected response — treat as unverified rather than not found
          return false;
        }
        const found = history.some(p => p.productId === AI_PRODUCT_ID);
        if (found) {
          await AIService.setUnlocked(true);
        }
        return found;
      });
    } catch (error) {
      console.warn('IAPService: unable to verify purchase history', error);
      return false;
    }
  },

  // Fetch the App Store product metadata (e.g. localised price string)
  // for display in the paywall UI.
  async getProductInfo() {
    const iap = _getIAP();
    if (!iap) {
      return null;
    }
    try {
      return await _withConnection(iap, async () => {
        const products = await iap.getProducts({ productIds: [AI_PRODUCT_ID] });
        return products && products.length > 0 ? products[0] : null;
      });
    } catch (error) {
      console.error('IAPService: error fetching product info', error);
      return null;
    }
  },

  // Initiate the one-time purchase flow.
  //
  // onDownloadStart: callback triggered after the transaction is
  // finished successfully — the caller should navigate to the
  // ModelDownloadScreen here.
  //
  // The product is treated as NON-CONSUMABLE (isConsumable: false) so that
  // StoreKit binds it to the Apple ID and allows cross-device restore.
  async purchaseAIUnlock(onDownloadStart) {
    // TODO: Remove DEV_BYPASS_IAP before release.
    if (DEV_BYPASS_IAP) {
      await AIService.setUnlocked(true);
      if (onDownloadStart) {
        onDownloadStart();
      }
      return { success: true };
    }

    const iap = _getIAP();
    if (!iap) {
      return { success: false, error: 'IAP not available in this build' };
    }
    try {
      return await _withConnection(iap, async () => {
        const purchase = await iap.requestPurchase({ sku: AI_PRODUCT_ID });

        // Acknowledge the transaction with the App Store
        await iap.finishTransaction({ purchase, isConsumable: false });

        // Persist the unlock flag locally
        await AIService.setUnlocked(true);

        // Trigger model download
        if (onDownloadStart) {
          onDownloadStart();
        }

        return { success: true };
      });
    } catch (error) {
      console.error('IAPService: purchase error', error);
      return { success: false, error };
    }
  },

  // Restore a previously purchased entitlement from the App Store.
  //
  // HOW CROSS-DEVICE RESTORE WORKS:
  //   1. User installs the app on a new device (AsyncStorage is empty).
  //   2. User navigates to the AI Expert screen and taps "Restore Purchases".
  //   3. This method calls getAvailablePurchases() — StoreKit verifies the
  //      Apple ID with Apple's servers and returns prior non-consumable
  //      purchases.
  //   4. If AI_PRODUCT_ID is found, we set the local unlock flag to true.
  //   5. The user then needs to re-download the model weights from CDN
  //      (the ~2.2 GB file is NOT transferred between devices; only the
  //      purchase entitlement is verified).
  //
  // Returns true if the entitlement was found and restored, false otherwise.
  async restorePurchases() {
    // TODO: Remove DEV_BYPASS_IAP before release.
    if (DEV_BYPASS_IAP) {
      return true;
    }

    const iap = _getIAP();
    if (!iap) {
      return false;
    }
    try {
      return await _withConnection(iap, async () => {
        const history = await iap.getAvailablePurchases();
        if (history == null) {
          return false;
        }
        const found = history.some(p => p.productId === AI_PRODUCT_ID);
        if (found) {
          await AIService.setUnlocked(true);
          return true;
        }
        return false;
      });
    } catch (error) {
      console.error('IAPService: error restoring purchases', error);
      return false;
    }
  },
};

export default IAPService;
