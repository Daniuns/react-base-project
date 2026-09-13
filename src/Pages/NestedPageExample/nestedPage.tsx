import { Outlet, useNavigate } from "react-router";
import useNestedPageExample from "./hooks/useNestedPageExample";
import { memo, useEffect } from "react";
import { Button } from "@/components/ui/button";

const NestedPage = memo(() => {
  const { tsData, postTSData } = useNestedPageExample();

  const navigation = useNavigate();

  useEffect(() => {
    postTSData(1);
  }, []);
  return (
    <div>
      <h1>Nested Page</h1>
      <Button onClick={() => navigation("another-nested-page")}>
        Go To anotherNestedPage
      </Button>
      <Outlet />
    </div>
  );
});
export default NestedPage;
