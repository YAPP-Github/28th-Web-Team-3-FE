import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = { title: "미션" };

export default function MissionPage() {
  return <ComingSoon title="미션" />;
}
