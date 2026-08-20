import React from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useGetTestByIdQuery } from "../store/apiSlice";
import QuizRunner from "../features/tests/QuizRunner";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

export default function QuizActivePage() {
  const { testId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const { data: test, isLoading } = useGetTestByIdQuery(testId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner label="Preparing assessment environment..." size="lg" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Test Not Found</h2>
          <p className="text-xs text-slate-500">
            The assessment you are trying to take does not exist or has expired.
          </p>
          <Link to="/tests">
            <Button variant="primary" size="sm" icon={ArrowLeft}>
              Return to Tests
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      <QuizRunner test={test} user={user} />
    </div>
  );
}
