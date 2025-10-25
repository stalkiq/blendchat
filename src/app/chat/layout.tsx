export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-black">
      <main className="flex h-full flex-1 flex-col">{children}</main>
    </div>
  );
}
