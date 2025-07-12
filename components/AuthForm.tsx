import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues, Path, //Generic base type that represents any object of form values.
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { z, ZodType } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constants";
import FileUpload from "./FileUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
/*import { useRouter } from "next/router"; this thing only works if you have name the file pages isntead
of app, if your application lies inside app folder you should use router from next/navigation*/

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router =useRouter();

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });
  
  const isSignIn = type === "SIGN_IN";

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result= await onSubmit(data);

    if(result.success){
      toast.success(isSignIn?"succesfully signed in": "sucessfuly signed up");
      router.push("/");
    } else{
      toast.error(isSignIn?"unable to sign in": "unable to sign up");

    }
    
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? "Welcome back to BookWise" : "Create your library account"}
      </h1>
      <p className="text-light-100">
        {isSignIn
          ? "Access the vast collection of resources, and stay updated"
          : "Please complete all fields and upload a valid university ID to gain access to the library"}
      </p>
      <Form {...form}>
        {/*here the form is the complete react-hook-form, you can use form.getvalues to get email,name etc from it*/}
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 w-full"
        >
          {Object.keys(defaultValues).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName as Path<T>}
              /*
               how does render function know what to render?
               React Hook Form looks at the name prop (fieldName as Path<T>) and uses that to register the field and 
               generate a field object with various property such as field.name,.value,.onchange etc
               and pass it to render
               */
              
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                  </FormLabel>
                    <FormControl>
                      {field.name === "universityCard" ? (
                        <FileUpload
                          type="image"
                          accept="image/*"
                          placeholder="Upload your ID"
                          folder="ids"
                          variant="dark"
                          onFileChange={field.onChange}
                        />
                      ) : (
                        <Input
                          required
                          type={
                            FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]
                          }
                          {...field}
                          className="form-input"
                        />
                      )}
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}

            />
          ))}
          <Button type="submit" className="form-btn">
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "New to BookWise? " : "Already have an account? "}

        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
      
    </div>
  );
};
export default AuthForm;
