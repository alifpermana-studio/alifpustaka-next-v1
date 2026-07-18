import NotFoundPage from "@/components/not-found/NotFoundPage";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export async function generateMetadata() {
  return {
    title: "Page Not Found",
    description: "You’ve wandered off the map.",
  };
}

export default function NotFound() {
  return (
    <main className="bg-base-100">
      <Navbar />
      <NotFoundPage />
      <Footer />
    </main>
  );
}
