import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const { data: employee } = await supabase
    .from("employees")
    .select("role")
    .eq("auth_id", user.id)
    .single();
  
  if (!employee) {
    redirect("/login?error=no_employee");
  }

  if (employee.role === "admin") {
    redirect("/admin");
  } else if (employee.role === "kiosk_security") {
    redirect("/kiosk");
  } else {
    redirect("/dashboard");
  }
}
