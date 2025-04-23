import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/Form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Firebase
import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// Schema
const FormSchema = z.object({
  adharNumber: z
    .string()
    .length(12, "Adhar number must be exactly 12 digits")
    .regex(/^\d+$/, "Adhar number must be numeric"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  age: z
    .string()
    .refine((val) => !isNaN(val) && Number(val) >= 18 && Number(val) <= 80, {
      message: "Age must be a number between 18 and 80",
    }),
  company: z.string().min(1, "Company is required"),
  experience: z.string().min(1, "Experience is required"),
  address: z.string().min(1, "Address is required"),
  highestEducation: z.string().min(1, "Highest Education is required"),
  mark: z.string().min(1, "Mark is required"),
  category: z.string().min(1, "Category is required"),
  distance: z.string().refine((val) => !isNaN(val) && Number(val) <= 75, {
    message: "Distance must be less than or equal to 75",
  }),
  priorityChoices: z
    .object({
      1: z.string().min(1, "Priority choice 1 is required"),
      2: z.string().min(1, "Priority choice 2 is required"),
      3: z.string().min(1, "Priority choice 3 is required"),
    })
    .refine(
      (data) => {
        const priorities = [data[1], data[2], data[3]];
        return new Set(priorities).size === priorities.length;
      },
      { message: "Priority choices must be unique" }
    ),
});

const initialFormData = {
  adharNumber: "",
  name: "",
  email: "",
  age: "",
  company: "",
  experience: "",
  address: "",
  highestEducation: "",
  mark: "",
  category: "",
  distance: "",
  priorityChoices: { 1: "", 2: "", 3: "" },
};

export default function Apply() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: initialFormData,
  });

  const onSubmit = async (data) => {
    const confirmed = window.confirm(
      "Are you sure all fields are filled in correctly?"
    );
    if (!confirmed) return;

    try {
      const formattedData = {
        ...data,
        age: Number(data.age),
        experience: Number(data.experience),
        mark: Number(data.mark),
        distance: Number(data.distance),
        submittedAt: Timestamp.now(),
      };

      await addDoc(collection(db, "applications"), formattedData);
      toast.success("Your submission was successful!");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Submission failed. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Application Form
      </h1>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto space-y-6"
        >
          {[
            { name: "adharNumber", label: "Adhar Number", type: "number" },
            { name: "name", label: "Name" },
            { name: "email", label: "Email" },
            { name: "age", label: "Age", type: "number" },
            { name: "company", label: "Company" },
            { name: "experience", label: "Experience (in years)", type: "number" },
            { name: "address", label: "Address" },
            { name: "highestEducation", label: "Highest Education" },
            { name: "mark", label: "Mark (in %)", type: "number", step: "0.01" },
            { name: "distance", label: "Distance (in km)", type: "number" },
          ].map(({ name, label, type = "text", step }) => (
            <FormField
              key={name}
              name={name}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type={type}
                      step={step}
                      placeholder={`Enter your ${label}`}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  {fieldState?.error && (
                    <FormMessage message={fieldState.error.message} />
                  )}
                </FormItem>
              )}
            />
          ))}

          {/* Category Dropdown */}
          <FormField
            name="category"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {["SC", "ST", "OBC", "General", "OEC", "Others"].map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                {fieldState?.error && (
                  <FormMessage message={fieldState.error.message} />
                )}
              </FormItem>
            )}
          />

          {/* Priority Choices Dropdown */}
          {["1", "2", "3"].map((key) => (
            <FormField
              key={key}
              name={`priorityChoices.${key}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority {key}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={`Select Department for Priority ${key}`}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ME">ME</SelectItem>
                      <SelectItem value="EE">EE</SelectItem>
                      <SelectItem value="EC">EC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg mt-8"
          >
            Submit
          </Button>
        </form>
      </FormProvider>

      <ToastContainer />
    </div>
  );
}
