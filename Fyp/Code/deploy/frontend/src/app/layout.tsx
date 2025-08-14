import { Metadata } from "next";
import ClientRoot from "./ClientRootLayout";

export const metadata: Metadata = {
  title: "Tilde Deploy",
  description: "self hoisted cloud brokerage system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <body>
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
