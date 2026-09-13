import { Route } from "react-router";
import NestedPage from "./nestedPage";
import AnotherNestedPage from "./AnotherNestedPage/anotherNestedPage";

const NestedPageRoutes = () => {
  return (
    <Route path="/nested-page" element={<NestedPage />}>
      <Route path="another-nested-page" element={<AnotherNestedPage />} />
    </Route>
  );
};

export default NestedPageRoutes;
