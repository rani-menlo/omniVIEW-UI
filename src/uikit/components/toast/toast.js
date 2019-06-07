import { message } from "antd";
class Toast {
  static error(msg) {
    message.open({ content: msg });
  }
}
