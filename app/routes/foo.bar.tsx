export default function Foo() {
  return (
    <main className="p-16">
      <h1 className="text-5xl font-medium mb-8">Foo route</h1>
      <div className="space-y-6">
        {/* <div>App name: {data.name}</div> */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          // onClick={handleInstallApp}
        >
          Install Github App
        </button>
      </div>
    </main>
  );
}
