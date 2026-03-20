import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { FileText } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h1 className="text-4xl font-semibold mb-2">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <Link to="/">
          <Button>Go to Login</Button>
        </Link>
      </div>
    </div>
  );
}
