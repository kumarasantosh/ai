import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex flex-col items-center  min-h-screen">
      <SignIn />
    </main>
  );
}
