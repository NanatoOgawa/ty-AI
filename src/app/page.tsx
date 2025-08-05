import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export default async function Home() {
  try {
    console.log("Root page: Starting authentication check");
    
    const supabase = await createClient();
    console.log("Root page: Supabase client created");
    
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log("Root page: Auth result:", { user: user?.email || "null", error });

    if (error) {
      console.error("Root page: Auth error:", error);
      redirect("/login");
    }

    if (user) {
      console.log("Root page: User authenticated, redirecting to dashboard");
      redirect("/dashboard");
    } else {
      console.log("Root page: No user, redirecting to login");
      redirect("/login");
    }
  } catch (error) {
    console.error("Root page: Unexpected error:", error);
    redirect("/login");
  }
}
