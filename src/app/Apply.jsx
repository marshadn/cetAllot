import { ApplicationForm } from "./admin/ApplicationForm";

export default function Apply() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Application Form
          </h1>
          <p className="text-gray-600 text-md max-w-2xl mx-auto">
            Please read the instructions carefully before filling out the form. 
            <strong className="text-red-600"> Once submitted, editing will not be possible.</strong> 
            Ensure all details are accurate and complete.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200">
          <ApplicationForm />
        </div>
      </div>
    </div>
  );
}
