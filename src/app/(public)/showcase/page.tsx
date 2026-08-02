import "./index.css";
import Showcase from "@/components/pages/showcase";

export async function generateMetadata() {
  return {
    title: "Showcase",
    description: "Ecommerce search template.",
  };
}

function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="w-full max-w-full">
        <Showcase />
      </div>
    </div>
  );
}

export default Page;
