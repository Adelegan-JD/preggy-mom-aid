import Link from "next/link";
import AuthLayout from "@/components/auth/auth-layout";

export default function NotFound() {
  return (
    <AuthLayout title="We could not find that page" lede="The link may be out of date, or the page may have moved.">
      <div className="ds-form-actions">
        <Link className="ds-btn ds-btn-primary" href="/">Go to the home page</Link>
        <Link className="ds-btn" href="/my-care">My health space</Link>
      </div>
    </AuthLayout>
  );
}
