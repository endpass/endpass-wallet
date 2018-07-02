import { NotificationError } from '@/class';
import { userService } from '@/services';

export default class ServerStorage {
  read(prop) {
    return Promise.resolve()
      .then(() => userService.getUser())
      .then(user => user[prop])
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't read data from server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  write(prop, data) {
    return Promise.resolve()
      .then(() => userService.setUser({ [prop]: data }))
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't save data to server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  remove(prop) {
    return Promise.resolve()
      .then(() => userService.setUser({ [prop]: null }))
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text:
            "Can't remove data from server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  clear() {
    return Promise.resolve()
      .then(() =>
        userService.setUser({
          net: null,
          networks: null,
          settings: null,
          tokens: null,
        })
      )
      .catch(() => {
        throw new NotificationError({
          title: 'Error in local storage',
          text: "Can't clear server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }
}
