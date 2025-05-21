import React from "react";
import BootstrapInit from "@/helper/BootstrapInit";
import RouteScrollToTop from "@/helper/RouteScrollToTop";
import { SpeedInsights } from '@vercel/speed-insights/next';


import "./font.css";
import "./globals.scss";

export const metadata = {
  title: "Digital Market Place NEXT Js Template",
  description:
    "DpMarket – Digital Products Marketplace NEXT JS Template – A versatile and meticulously designed set of templates crafted to elevate your Digital Products Marketplace content and experiences.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >

      <body suppressHydrationWarning={true}>
        <BootstrapInit />
        <RouteScrollToTop />
         {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
