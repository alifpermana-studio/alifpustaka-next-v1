import { SignUpForm } from "@/components/pages/signup-form";

export async function generateMetadata() {
  return {
    title: "Sign up to Alif Pustaka",
    description: "Join our comunity.",
  };
}

function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <SignUpForm />
      </div>
    </div>
  );
}

export default Page;
