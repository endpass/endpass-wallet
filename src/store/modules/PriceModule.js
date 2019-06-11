import { Module, Mutation, Action } from 'vuex-class-modules';
import get from 'lodash/get';
import { cryptoDataService } from '@/services';
import VuexModuleWithRoot from '@/store/class/VuexModuleWithRoot';

@Module
class PriceModule extends VuexModuleWithRoot {
  isLoading = false;

  price = null;

  timeoutId = null;

  // TODO: need web3, user stores implement to remove this.store.get()

  get activeCurrencyName() {
    return this.store.get().state.web3.activeCurrency.name;
  }

  get fiatCurrency() {
    return this.store.get().state.user.settings.fiatCurrency;
  }

  @Mutation
  startLoading() {
    this.isLoading = true;
  }

  @Mutation
  stopLoading() {
    this.isLoading = false;
  }

  @Mutation
  setPrice(val) {
    this.price = val;
  }

  @Mutation
  setTimeoutId(val) {
    this.timeoutId = val;
  }

  @Action
  async updatePrice() {
    try {
      this.startLoading();

      const price = await cryptoDataService.getSymbolsPrices(
        this.activeCurrencyName,
        this.fiatCurrency,
      );

      this.setPrice(get(price, `ETH.${this.fiatCurrency}`, 0));

      this.modules.connectionStatus.updateApiErrorStatus({
        id: 'price',
        status: true,
      });
    } catch (e) {
      e.apiError = {
        id: 'price',
        status: false,
      };
      this.modules.errors.emitError(e);
    } finally {
      this.stopLoading();
    }

    clearTimeout(this.timeoutId);
    const timeoutId = setTimeout(
      this.updatePrice.bind(this),
      ENV.VUE_APP_PRICE_UPDATE_INTERVAL,
    );
    this.setTimeoutId(timeoutId);
  }

  @Action
  init() {
    this.updatePrice();
  }
}

export default PriceModule;
