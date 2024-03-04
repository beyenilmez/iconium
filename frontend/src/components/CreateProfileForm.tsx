"use client"

import { AddProfile } from "wailsjs/go/main/App";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  /* FormDescription, */
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const AddProfileF = (name: string) => {
  AddProfile(name).then(() => {
    console.log("Profile created: " + name);
    // select profile
  });
}

const formSchema = z.object({
  profileName: z.string()
    .min(1, { message: "Profile name is required" })
    .max(50, { message: "Profile name can not exceed 50 characters" })
    // Check for windows file name compatibility
    .regex(/^(?!\.)/, { message: "Profile name can not start with a period" })
    .regex(/^(?!.*\.$)/, { message: "Profile name can not end with a period" })
    .regex(/^[^<>:"/\\|?*]*$/, { message: "Profile name can not contain any of the following characters: < > : \" / \\ | ? *" })
    .regex(/^(?!con$)(?!prn$)(?!aux$)(?!nul$)(?!com[0-9]$)(?!lpt[0-9]$)(?!com[¹²³])(?!lpt[¹²³])/i, { message: "Profile name can not be any of the following: con, prn, aux, nul, com[0-9], lpt[0-9], com⁽¹⁻³⁾, lpt⁽¹⁻³⁾" })
  ,
})

export function CreateProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileName: "",
    }
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    AddProfileF(data.profileName);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
        <FormField
          control={form.control}
          name="profileName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile name</FormLabel>
              <FormControl>
                <Input placeholder="My profile" {...field} />
              </FormControl>
              {/* <FormDescription>
                This is the name of your profile
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  )

}