import "./globals.css";
import ClientShell from "@/components/ClientShell";

export const metadata = {
  title: "HTP Service Suite",
  description: "Disposition & CRM für HTP Service Partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
