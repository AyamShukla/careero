import SignUpForm from "../components/auth/SignUpForm";
import { Link } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4">
      <div className="flex flex-col items-center mb-8">
        <BriefcaseBusiness size={48} className="text-primary mb-2" />
        <h1 className="text-4xl font-bold text-primary">Careero</h1>
        <p className="text-base-content/60 mt-1">Connect. Grow. Succeed.</p>
      </div>

      <div className="bg-base-100 rounded-2xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">Create your account</h2>
        <SignUpForm />
        <p className="text-center mt-4 text-sm text-base-content/60">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;