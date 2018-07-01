import axios from 'axios';
import { NotificationError } from '@/class';

export default {
  login(email) {
    // return axios
    //   .post('https://endpass.com/api/v1/auth', {
    //     params: {
    //       email,
    //     },
    //   })
    //   .then(console.log)
    //   .catch(console.log);

    const error = new NotificationError({
      title: 'Auth error',
      text: 'Something went wrong in the auth process. Please, try again',
      type: 'is-danger',
    });

    return Promise.resolve({
      success: true,
      challenge: {
        challenge_type: 'email_link',
      },
    })
      .then(({ success, challenge }) => {
        if (!success) {
          throw error;
        }

        return challenge.challenge_type;
      })
      .catch(() => {
        throw error;
      });
  },
};
