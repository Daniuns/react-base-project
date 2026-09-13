import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import ProtectedRoute from "./protectedRoute";

const Home = lazy(() => import("@/Pages/Home/home"));
const Login = lazy(() => import("@/Pages/Login/login"));
const Creatures = lazy(() => import("@/Pages/Creatures/creatures"));
const NestedPage = lazy(() => import("@/Pages/NestedPageExample/nestedPage"));
const AnotherNestedPage = lazy(
  () => import("@/Pages/NestedPageExample/AnotherNestedPage/anotherNestedPage"),
);
const PrivatePage = lazy(
  () => import("@/Pages/PrivatePageExample/privatePage"),
);
const NotFound = lazy(() => import("@/Pages/NotFound/not-found"));

export const AppRouter = () => (
  <Suspense
    fallback={
      <main className="grid min-h-dvh place-items-center" aria-busy="true">
        <p className="text-sm text-muted-foreground">Loading page…</p>
      </main>
    }
  >
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/creatures" element={<Creatures />} />
      <Route path="/nested-page" element={<NestedPage />}>
        <Route path="another-nested-page" element={<AnotherNestedPage />} />
      </Route>
      <Route
        path="/private"
        element={
          <ProtectedRoute>
            <PrivatePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);
