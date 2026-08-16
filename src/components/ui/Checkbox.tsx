import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: React.ReactNode;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, children, indeterminate = false, className, style, ...props },
    forwardedRef,
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(
      forwardedRef,
      () => innerRef.current as HTMLInputElement,
    );

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const checkboxElement = (
      <input
        ref={innerRef}
        type="checkbox"
        className={className}
        style={style}
        {...props}
      />
    );

    const labelContent = label ?? children;

    if (labelContent) {
      return (
        <label className="checkbox-label">
          {checkboxElement}
          <span>{labelContent}</span>
        </label>
      );
    }

    return checkboxElement;
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
