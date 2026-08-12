import React, { forwardRef } from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.nativeEvent.isComposing) {
        e.currentTarget.blur();
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return <input ref={ref} onKeyDown={handleKeyDown} {...props} />;
  },
);

Input.displayName = "Input";

export default Input;
