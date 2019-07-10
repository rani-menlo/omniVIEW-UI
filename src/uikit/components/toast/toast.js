import { message } from "antd";
class Toast {
  static text(msg) {
    message.open({ content: msg });
  }
  static error(msg) {
    message.error(msg);
  }

  static success(msg) {
    message.success(msg);
  }
}

export default Toast;
