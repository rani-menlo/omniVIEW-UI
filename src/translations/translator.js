import { intl } from ".";

const translate = (id, values) => {
  return intl.formatMessage({ id }, values);
};

export { translate };
