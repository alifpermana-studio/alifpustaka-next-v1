import Homepage from "@/components/pages/homepage";

export async function generateMetadata() {
  return {
    title: "Alif Pustaka Homepage",
    description:
      "A place to store your collection of templates, tools and web projects.",
  };
}

function Page() {
  return (
    <div>
      <Homepage />
    </div>
  );
}

export default Page;
