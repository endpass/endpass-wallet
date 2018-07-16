import { NotificationError } from '@/class';
import { userService } from '@/services';

export default class ServerStorage {
  read(prop) {
    return Promise.resolve()
      .then(() => userService.getSettings())
      .then(user => user[prop])
      .catch(() => {
        throw new NotificationError({
          title: 'Error in server storage',
          text:
            "Can't read data from server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  readAll() {
    return Promise.resolve()
      .then(() => userService.getFullUserInfo())
      .then(user => user || {})
      .catch(() => {
        throw new NotificationError({
          title: 'Error in server storage',
          text: "Can't read data from server storage. Please, reload page",
          type: 'is-warning',
        });
      });
  }

  write(prop, data) {
    return Promise.resolve()
      .then(() => userService.setSettings({ [prop]: data }))
      .catch(() => {
        throw new NotificationError({
          title: 'Error in server storage',
          text: "Can't save data to server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  writeBulk(dataObj) {
    return Promise.resolve()
      .then(() => userService.setSettings(dataObj))
      .catch(() => {
        throw new NotificationError({
          title: 'Error in server storage',
          text: "Can't save data to server storage, maybe it is not available",
          type: 'is-warning',
        });
      });
  }

  remove(prop) {
    return Promise.resolve();
  }

  clear() {
    return Promise.resolve();
  }
}
