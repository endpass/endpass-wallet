import axios from 'axios'

export default {
  getTokensList() {
    return axios.get(`https://tokeninfo.endpass.com/api/v1/tokens`);
  }
}
