import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata = {
  title: "PeakLog",
  description: "Mój dziennik górski",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
