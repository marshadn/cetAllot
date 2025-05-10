import { ApplicationForm } from "./admin/ApplicationForm";


export default function Apply() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Application Form</h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <ApplicationForm />
      </div>
    </div>
  );
}
