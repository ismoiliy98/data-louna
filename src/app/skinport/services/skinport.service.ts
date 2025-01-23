import { SKINPORT_API_URL } from '$/skinport/constants';
import type { SkinportItem, SkinportItemRaw } from '$/skinport/types';
import { Env, UnixTime } from '~/constants';
import { getCacheClient } from '~/lib';

class SkinportService {
  private readonly authToken: string;
  private readonly defaultHeaders = new Headers();
  private readonly items = new Map<string, SkinportItem>();
  private prefetchPromise: Promise<void> | null = null;
  private readonly abortController = new AbortController();
  private readonly cacheKey = 'skinport:items';

  constructor() {
    const { SKINPORT_CLIENT_ID, SKINPORT_CLIENT_SECRET } = Env;

    this.authToken = Buffer.from(
      `${SKINPORT_CLIENT_ID}:${SKINPORT_CLIENT_SECRET}`
    ).toString('base64');
    this.defaultHeaders.set('Authorization', `Basic ${this.authToken}`);
    this.defaultHeaders.set('Accept-Encoding', 'br');
    this.prefetchPromise = this.prefetchItems();
  }

  private async fetchSkinportItems(tradable = false) {
    try {
      const url = new URL('/v1/items', SKINPORT_API_URL);
      url.searchParams.set('app_id', '730');
      url.searchParams.set('currency', 'EUR');
      url.searchParams.set('tradable', tradable.toString());

      const response = await fetch(url.href, {
        headers: this.defaultHeaders,
        signal: this.abortController.signal,
      });
      const items = (await response.json()) as SkinportItemRaw[];
      return items;
    } catch (error) {
      console.error('Failed to fetch items from Skinport', error);
      return [];
    }
  }

  private processItems(
    items: SkinportItemRaw[],
    tradableItems: SkinportItemRaw[]
  ) {
    for (const item of items) {
      this.items.set(item.market_hash_name, {
        hashName: item.market_hash_name,
        minPrice: item.min_price,
        minPriceTradable:
          tradableItems.find(
            ({ market_hash_name }) => market_hash_name === item.market_hash_name
          )?.min_price || item.min_price,
      });
    }
  }

  public async prefetchItems() {
    try {
      if (this.prefetchPromise) {
        return this.prefetchPromise;
      }

      const loaded = await this.loadItemsFromCache();

      if (loaded) {
        return;
      }

      const [items, tradableItems] = await Promise.all([
        this.fetchSkinportItems(),
        this.fetchSkinportItems(true),
      ]);

      this.processItems(items, tradableItems);
      await this.saveItemsToCache();
    } catch (error) {
      console.error('Failed to prefetch items from Skinport', error);
    } finally {
      this.prefetchPromise = null;
      setTimeout(() => this.prefetchItems(), UnixTime.Hour);
      console.log('Prefetched items from Skinport');
    }
  }

  private async saveItemsToCache() {
    const cache = await getCacheClient();
    return cache.set(
      this.cacheKey,
      JSON.stringify(Array.from(this.items.values())),
      { EXAT: Math.floor((Date.now() + UnixTime.Hour) / 1_000) }
    );
  }

  private async loadItemsFromCache() {
    try {
      const cache = await getCacheClient();
      const items = await cache.get(this.cacheKey);

      if (items) {
        const parsedItems = JSON.parse(items) as SkinportItem[];

        for (const item of parsedItems) {
          this.items.set(item.hashName, item);
        }

        return true;
      }
    } catch (error) {
      console.error('Failed to load items from cache', error);
    }

    return false;
  }

  public async getItems() {
    if (this.prefetchPromise) {
      await this.prefetchPromise;
    }

    return Array.from(this.items.values());
  }

  public async invalidateCache() {
    if (this.prefetchPromise) {
      this.abortController.abort();
      this.prefetchPromise = null;
    }

    const cache = await getCacheClient();
    return cache.del(this.cacheKey);
  }
}

export const skinportService = new SkinportService();
