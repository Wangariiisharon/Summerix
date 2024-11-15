export const metadata = {
  title: "Forbidden",
};

export default function ForbiddenPage() {
  return (
    <main className="mt-10 flex items-center justify-center">
      <div className="p-4 font-medium text-gray-600">
        <div className="text-center text-5xl font-extrabold">403</div>
        <p className="mt-5 text-red-500">
          You are not authorised to view this page.
        </p>
      </div>
    </main>
  );
}
