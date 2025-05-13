"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Toast } from "@/components/ui/toast";

export default function CreateKPIPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState(0);
  const [weight, setWeight] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/protected/kpi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({
          title,
          description,
          target_value: targetValue,
          weight,
        }),
      });

      if (!res.ok) throw new Error("Failed to create KPI");

      Toast({ title: "Success" });

      router.push("/protected/kpi");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create KPI</h1>
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Target Value"
        value={targetValue}
        onChange={(e) => setTargetValue(parseFloat(e.target.value))}
      />
      <Input
        type="number"
        placeholder="Weight (e.g. 0.25)"
        value={weight}
        onChange={(e) => setWeight(parseFloat(e.target.value))}
      />
      <Button onClick={handleSubmit}>Create KPI</Button>
    </div>
  );
}
