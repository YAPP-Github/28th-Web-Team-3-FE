import { HomePageSkeleton } from "@/app/(tabs)/_components/home-page.skeleton";
import { MissionPageSkeleton } from "@/app/(tabs)/mission/_components/mission-page.skeleton";
import { RouteLoading } from "./route-loading";

export function InitialRouteSkeleton({ pathname }: { pathname: string | null }) {
  if (pathname === "/") return <HomePageSkeleton />;
  if (pathname === "/mission") return <MissionPageSkeleton />;
  return <RouteLoading />;
}
