import { IntlProvider, addLocaleData } from "react-intl";
import locale_en from "react-intl/locale-data/en";
import messages_en from "./en.json";

const messages = {
  en: messages_en
};

addLocaleData([...locale_en]);

const intlProvider = new IntlProvider({ locale: "en", messages: messages.en });
const { intl } = intlProvider.getChildContext();

export { intl };
