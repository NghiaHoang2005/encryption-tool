import { AppRoutes } from "./routes";
import { AppProviders } from "./providers";

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
