import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <Button onClick={() => void navigate("/")}>Back home</Button>
      </div>
    </main>
  );
};

export default NotFound;
