"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "../ui/button";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Image
          src={session.user?.image || ""}
          width={100}
          height={100}
          alt="avatar"
        />
        <p className="mb-4"> {session.user?.email}</p>
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    );
  }
}
