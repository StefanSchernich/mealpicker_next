import { ForwardedRef, forwardRef } from "react";

type NotificationProps = {
  type: "noDishFound" | "addSuccess";
  children: React.ReactNode;
};
const Notification = forwardRef(function Notification(
  props: NotificationProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { type, children } = props;
  let style = "";
  let message = "Default message";
  if (type === "noDishFound") {
    style = "bg-red-300 text-red-900 border-red-900 border-2 rounded-md p-4";
    message = "Kein Gericht gefunden";
  }
  return (
    <div ref={ref} className={style}>
      {children}
    </div>
  );
});

export default Notification;
