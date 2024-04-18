import { ForwardedRef, forwardRef } from "react";

type NotificationProps = {
  type: "fail" | "success";
  children: React.ReactNode;
};

//TODO: Add reset or smth else
const Notification = forwardRef(function Notification(
  props: NotificationProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { type, children } = props;
  let style = "";
  if (type === "fail") {
    style =
      "bg-red-300 text-red-900 border-red-900 border-2 rounded-md p-4 mt-6";
  }
  if (type === "success") {
    style =
      "bg-green-300 text-green-900 border-green-900 border-2 rounded-md p-4 mt-6";
  }
  return (
    <div ref={ref} className={style}>
      {children}
    </div>
  );
});

export default Notification;
