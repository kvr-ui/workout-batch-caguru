import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import WorkoutBatch from "./components/WorkoutBatch";
import WorkoutBatchSuccess from "./components/Workoutbatchsuccess";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <WorkoutBatch /> },
  { path: "/workout-batch", element: <WorkoutBatch /> },
  { path: "/workout-batch-success", element: <WorkoutBatchSuccess /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
