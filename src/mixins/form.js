export default {
  computed: {
    isFormValid() {
      const { fields, errors } = this;
      if (!(fields || errors)) {
        return true;
      }
      const hasInvalidField = Object.keys(fields).some(
        field => fields[field] && fields[field].invalid,
      );
      return !(hasInvalidField || errors.any());
    },
  },
  $_veeValidate: {
    validator: 'new',
  },
};
