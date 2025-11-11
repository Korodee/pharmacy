"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WebOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to requests page by default
    router.replace("/admin/web-orders/requests");
  }, [router]);

  return null;
}
