import state from '@/store/web3/web3'
import LocalStorageMock from '../localStorageMock.js'
import testAction from './ActionTestingHelper'

global.localStorage = LocalStorageMock;

describe('web3 store', () => {
	let stateInstance
	beforeEach(() => {
  	localStorage.setItem('net', 1);
  	localStorage.setItem('networks', JSON.stringify([{name: 'TestNet',id:4, url: 'https://testnet.infura.io/'}]));
  	stateInstance = state.state();
	})

  it('should get net value from local storage', () => {
    expect(stateInstance.activeNet.id).toBe(1);
    expect(stateInstance.storedNetworks.length).toBe(1);
    expect(stateInstance.storedNetworks[0].id).toBe(4);
  })

  it('should get full list of networks', () => {
  	let netList = state.getters.networks(stateInstance);
    expect(netList.length).toBe(4);
  })


  it('should change network', () => {
  	state.mutations.changeNetwork(stateInstance, {name: 'TestNet',id:4, url: 'https://testnet.infura.io/'});
  	expect(stateInstance.activeNet.id).toBe(4);
  })


  it('should add provider network', () => {
  	state.mutations.addNewProvider(stateInstance,{
  		name: 'Test',
  		id: 5,
  		url: 'test.test'
  	});
  	expect(stateInstance.storedNetworks.length).toBe(2);
  	expect(stateInstance.storedNetworks[1].id).toBe(5);
  })

  it('should change network', (done) => {
  	testAction(state.actions.changeNetwork, 3, {
  		getters: {
  			networks :  [{
  				id: 1
  			}, {
  				id:2
  			}, {
  				id:3
  			}]
			}
    }, [
			{ type : 'changeNetwork' }
    ],[
      { type: 'subscribeOnSyncStatus'},
			{ type: 'subscribeOnBlockUpdates' },
			{ type: 'tokens/subscribeOnTokenUpdates'}
    ], done);
  })
  it('should subscribe on sync status', (done) => {
    let eth = {
      isSyncing :() => {
        return new Promise((res, rej) => {
          res(1);
        })
      }
    }
    let contextMock = {
      state: {
        web3 : {
          currentProvider: 0,
          eth
        }
      },
      commit: () => {},
      dispatch: () => {}
    }
    const spyIsSyncing = jest.spyOn(eth, 'isSyncing')
    state.actions.subscribeOnSyncStatus(contextMock);
    expect(spyIsSyncing).toHaveBeenCalled();
    done()
  })
  it('should add provider network', (done) => {
  	testAction(state.actions.addNewProvider, {
  		id: 3
  	}, {
  		getters: {
  			networks :  [{
  				id: 1
  			}, {
  				id:2
  			}, {
  				id:3
  			}]
			}
    }, [
			{ type : 'addNewProvider' }
    ],[
			{ type : 'changeNetwork' }
    ], done);
  })
})
