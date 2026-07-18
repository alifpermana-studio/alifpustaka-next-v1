import { SignInForm } from "@/components/pages/signin-form";

export async function generateMetadata() {
  return {
    title: "Sign in to Alif Pustaka",
    description: "Please sign in to access certain features.",
  };
}

function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <SignInForm />
      </div>
    </div>
  );
}

export default Page;
