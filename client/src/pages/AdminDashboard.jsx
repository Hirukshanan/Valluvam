function AdminDashboard() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-lg text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-charcoal-800 sm:text-3xl">
          Welcome to the Valluvam Admin Dashboard
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-charcoal-500 sm:text-base">
          Use the sidebar to manage events, gallery, volunteers, and more.
          <br />
          Dashboard features will be added in a future stage.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
