import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const Home = () => {
  const navigate = useNavigate();

  const goToNestedPage = () => {
    navigate("/nested-page");
  };

  const goToPrivatePage = () => {
    navigate("/private");
  };

  return (
    <div>
      <h1>Home</h1>
      <Button onClick={goToNestedPage}>Go to Nested Page</Button>
      <Button onClick={goToPrivatePage}>Go to Private Page</Button>
    </div>
  );
};
export default Home;
