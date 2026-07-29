import { useRouter } from "next/navigation";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthPromptModal({ isOpen, onClose }: AuthPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    router.push("/signin");
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Sign In Required</h3>
        <p className="py-4">
          You need to sign in to post comments. Join our community to share your thoughts!
        </p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSignIn}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
