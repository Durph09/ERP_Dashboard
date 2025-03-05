 // generate a layout for the protected page



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <main className="w-full h-min-screen">{children}</main>

  );
}
