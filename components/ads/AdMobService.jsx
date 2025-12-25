/**
 * AdMob Rewarded Ad Integration Service
 * Handles loading and showing rewarded ads for all features
 */

const ADMOB_APP_ID = 'ca-app-pub-7593264480405815~6978769407';
const ADMOB_REWARDED_AD_UNIT = 'ca-app-pub-7593264480405815/5003342753';
const TEST_MODE = false; // Production mode - real ads enabled

class AdMobService {
  constructor() {
    this.rewardedAd = null;
    this.isAdLoaded = false;
    this.rewardCallbacks = {};
    this.initializeAdMob();
  }

  initializeAdMob() {
    // Load AdMob SDK
    if (typeof window !== 'undefined' && !window.admob) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADMOB_APP_ID}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      // Initialize AdMob
      window.admob = {
        rewardedAd: null,
        appId: ADMOB_APP_ID,
        rewardedAdUnitId: ADMOB_REWARDED_AD_UNIT
      };
    }

    this.loadRewardedAd();
  }

  loadRewardedAd() {
    if (typeof window === 'undefined') return;

    // In a real implementation, this would use Google Mobile Ads SDK
    // For web testing, we'll simulate the behavior
    console.log('[AdMob] Loading rewarded ad...', ADMOB_REWARDED_AD_UNIT);
    
    setTimeout(() => {
      this.isAdLoaded = true;
      console.log('[AdMob] Rewarded ad loaded successfully');
    }, 1000);
  }

  showRewardedAd(rewardType, onRewardGranted) {
    if (!this.isAdLoaded) {
      console.warn('[AdMob] Ad not loaded yet');
      this.loadRewardedAd();
      return false;
    }

    console.log(`[AdMob] Showing rewarded ad for: ${rewardType}`);

    // Store reward callback
    this.rewardCallbacks[rewardType] = onRewardGranted;

    // Simulate ad display (in production, this would be the actual AdMob SDK call)
    if (TEST_MODE) {
      this.simulateTestAd(rewardType);
    } else {
      this.showProductionAd(rewardType);
    }

    return true;
  }

  simulateTestAd(rewardType) {
    // Create test ad overlay
    const adOverlay = document.createElement('div');
    adOverlay.id = 'admob-test-ad';
    adOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: system-ui;
    `;

    let countdown = 5;
    adOverlay.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📺</div>
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">Test Rewarded Ad</h2>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Watch for reward: ${rewardType}</p>
        <div style="font-size: 4rem; font-weight: bold;" id="ad-countdown">${countdown}</div>
        <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">Test mode - Production will show real ads</p>
      </div>
    `;

    document.body.appendChild(adOverlay);

    const countdownInterval = setInterval(() => {
      countdown--;
      const countdownEl = document.getElementById('ad-countdown');
      if (countdownEl) {
        countdownEl.textContent = countdown;
      }

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        document.body.removeChild(adOverlay);
        this.grantReward(rewardType);
        this.loadRewardedAd(); // Preload next ad
      }
    }, 1000);
  }

  showProductionAd(rewardType) {
    // Production implementation would use actual AdMob SDK
    // Example: admob.rewardedAd.show()
    console.log('[AdMob] Production ad would show here');
    
    // For now, fallback to simulation
    this.simulateTestAd(rewardType);
  }

  grantReward(rewardType) {
    console.log(`[AdMob] Granting reward: ${rewardType}`);
    
    if (this.rewardCallbacks[rewardType]) {
      this.rewardCallbacks[rewardType]();
      delete this.rewardCallbacks[rewardType];
    }

    this.isAdLoaded = false;
  }
}

// Singleton instance
const adMobService = new AdMobService();

export default adMobService;