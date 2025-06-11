import * as React from "react";
import { useFormContext, FormProvider as RHFormProvider, useController } from "react-hook-form";

// Form Component: Wraps the form and expects methods to be passed in
export function Form({ children, onSubmit, ...props }) {
  const methods = useFormContext(); // Accessing the form context here
  return (
    <form {...methods} onSubmit={onSubmit} {...props}>
      {children}
    </form>
  );
}

// FormProviderWrapper: Provides the form context to the children and handles form submission
export function FormProviderWrapper({ children, methods, onSubmit }) {
  return (
    <RHFormProvider {...methods}>
      {/* Removed the <form> tag here */}
      {children}
    </RHFormProvider>
  );
}

// FormField: Takes a name and render function to handle form field rendering
export function FormField({ name, render }) {
  const { control } = useFormContext(); // Use form context to retrieve control
  const { field, fieldState } = useController({ name, control });

  return render({ field, fieldState });
}

// FormItem: A wrapper for form item styling (you can customize this)
export function FormItem({ children, className }) {
  return <div className={`space-y-2 ${className || ""}`}>{children}</div>;
}

// FormLabel: Label component for form fields
export function FormLabel({ children, className }) {
  return <label className={`block text-sm font-medium ${className}`}>{children}</label>;
}

// FormControl: A wrapper for the form control (input or other form controls)
export function FormControl({ children, className }) {
  return <div className={className}>{children}</div>;
}

// FormMessage: Displays an error message if provided
export function FormMessage({ message, className }) {
  return message ? <p className={`text-red-500 text-sm ${className}`}>{message}</p> : null;
}

// FormDescription: A description that appears under a form control
export function FormDescription({ className, children, ...props }) {
  return (
    <p className={`text-sm text-muted-foreground ${className || ""}`} {...props}>
      {children}
    </p>
  );
}
